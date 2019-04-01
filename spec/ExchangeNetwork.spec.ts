import { TestFixture, Test, TestCase, Expect } from "alsatian";
import { Pair, Exchange, Market, ExchangeOrder, Side, ExchangeNetwork } from "../src/index";
import { pairToString } from "../src/Utility";
import { testPairs } from "./Exchange.data.spec";
import { recordTestCases } from "./OrderList.data.spec";

@TestFixture("Exchange")
export class ExchangeTests {
    _expectExchangeToBeValid(name: string): ExchangeNetwork {
        let network = new ExchangeNetwork();
        network.addExchange(name);

        let exchange = network.exchanges.get(name);

        Expect(exchange).toBeDefined();
        Expect(exchange.name).toEqual(name);

        return network;
    }

    @Test("addExchange")
    public addExchangeTest() {
        this._expectExchangeToBeValid("Coinbase Pro");
    }

    @Test("addExchange > existing exchange")
    public addExchangeFailureTest() {
        let exchangeName = "Coinbase Pro";
        let network = this._expectExchangeToBeValid(exchangeName);

        let addExistingExchange = () => {
            network.addExchange(exchangeName);
        }

        Expect(addExistingExchange).toThrow();
    }

    @Test("deleteExchange")
    public deleteExchangeTest() {
        let exchangeName = "Coinbase Pro";
        let network = this._expectExchangeToBeValid(exchangeName);
        network.deleteExchange(exchangeName);

        let exchange = network.exchanges.get(exchangeName);

        Expect(exchange).not.toBeDefined();
    }

    @Test("getExchange")
    public getExchangeTest() {
        let exchangeName = "Coinbase Pro";
        let network = this._expectExchangeToBeValid(exchangeName);
        let exchange = network.getExchange(exchangeName);

        Expect(exchange).toBeDefined();
    }

    @Test("getMarket")
    public getMarketTest() {
        let exchangeName = "Coinbase Pro";
        let pair: Pair = { base: "BTC", quote: "USD" };
        let network = this._expectExchangeToBeValid(exchangeName);
        let exchange = network.getExchange(exchangeName);
        exchange.addMarket(pair);

        let market = network.getMarket(exchangeName, pair);

        Expect(market).toBeDefined();
    }

    @Test("getMarket > nonexistent exchange")
    public getExchangeFailureTest1() {
        let network = new ExchangeNetwork();
        let pair = { base: "BTC", quote: "USD" };

        let getNonexistentExchange = () => {
            network.getMarket("404", pair);
        }

        Expect(getNonexistentExchange).toThrow();
    }

    @Test("getMarket > nonexistent market")
    public getExchangeFailureTest2() {
        let exchangeName = "Coinbase Pro";
        let pair = { base: "BTC", quote: "USD" };
        let network = new ExchangeNetwork();
        network.addExchange(exchangeName);

        let getNonexistentMarket = () => {
            network.getMarket(exchangeName, pair);
        }

        Expect(getNonexistentMarket).toThrow();
    }

    public _addExchangesAndMarkets(exchangeNames: string[], pair: Pair): ExchangeNetwork {
        let network = new ExchangeNetwork();

        exchangeNames.forEach(exchangeName => {
            let exchange = network.addExchange(exchangeName);
            exchange.addMarket(pair);
        });

        return network
    }

    @Test("getAllMarketsFor")
    public getAllMarketsForTest() {
        let exchangeNames = ["Coinbase Pro", "Gemini", "Kraken"];
        let pair: Pair = { base: "BTC", quote: "USD" };
        let network = this._addExchangesAndMarkets(exchangeNames, pair);

        let markets = network.getAllMarketsFor(pair);

        Expect(markets.length).toEqual(exchangeNames.length);
    }

    @Test("deleteAllMarketsFor")
    public deleteAllMarketsForTest() {
        let exchangeNames = ["Coinbase Pro", "Gemini", "Kraken"];
        let pair: Pair = { base: "BTC", quote: "USD" };
        let network = this._addExchangesAndMarkets(exchangeNames, pair);

        network.deleteAllMarketsFor(pair);
        let markets = network.getAllMarketsFor(pair);

        Expect(markets.length).toEqual(0);
    }

    public _recordOrderTest(testCaseName: string, exchangeName: string, pair: Pair): ExchangeNetwork {
        let testCase = recordTestCases[testCaseName];
        let network = new ExchangeNetwork();
        let exchange = network.addExchange(exchangeName);
        let market = exchange.addMarket(pair);

        testCase.input.forEach(_order => {
            network.recordOrder({
                exchangeName,
                side: testCase.side,
                pair,
                price: _order.price,
                amount: _order.amount
            });
        });

        let orderArr = market.orderBook
            .getList(testCase.side)
            .toArray();

        Expect(orderArr.length).toEqual(testCase.expected.length);

        testCase.expected.forEach((expected, i) => {
            Expect(orderArr[i].price).toEqual(expected.price);
            Expect(orderArr[i].amount).toEqual(expected.amount);
        });

        return network;
    }

    @Test("recordOrder")
    public recordOrderTest() {
        testPairs.forEach(pair => {
            this._recordOrderTest("insertion", "Kraken", pair);
        });
    }

    @Test("deleteOrder")
    public deleteOrderTest() {
        testPairs.forEach(pair => {
            let exchangeName = "Kraken";
            let network = this._recordOrderTest("insertion", exchangeName, pair);
            network.deleteOrder(1000, exchangeName, pair, Side.Bid);

            let exchange = network.getExchange(exchangeName);
            let market = exchange.getMarket(pair);
            let orderArr = market.orderBook.bids.toArray();

            Expect(orderArr.length).toEqual(3);
        });
    }

    @Test("getBestBidFor")
    public getBestBidForTest() {
        let pair: Pair = { base: "BTC", quote: "USD" };
        let network = new ExchangeNetwork();
        let coinbasePro = network.addExchange("Coinbase Pro");
        let gemini = network.addExchange("Gemini");

        coinbasePro.addMarket(pair);
        gemini.addMarket(pair);

        network.recordOrder({
            exchangeName: coinbasePro.name,
            side: Side.Bid,
            pair,
            price: 1000,
            amount: 1
        });

        network.recordOrder({
            exchangeName: gemini.name,
            side: Side.Bid,
            pair,
            price: 2000,
            amount: 1
        });

        let bestBid = network.getBestBidFor(pair);

        Expect(bestBid.exchange).toBe(gemini);
        Expect(bestBid.price).toEqual(2000);
    }

    @Test("getBestBidFor")
    public getBestBidForFailureTest() {
        let pair: Pair = { base: "BTC", quote: "USD" };
        let network = new ExchangeNetwork();
        let coinbasePro = network.addExchange("Coinbase Pro");
        let gemini = network.addExchange("Gemini");

        let getBestBidWithNoMarkets = () => {
            let bestBid = network.getBestBidFor(pair);
        } 

        Expect(getBestBidWithNoMarkets).toThrow();
    }

    @Test("getBestAskFor")
    public getBestAskForTest() {
        let pair: Pair = { base: "BTC", quote: "USD" };
        let network = new ExchangeNetwork();
        let coinbasePro = network.addExchange("Coinbase Pro");
        let gemini = network.addExchange("Gemini");

        coinbasePro.addMarket(pair);
        gemini.addMarket(pair);

        network.recordOrder({
            exchangeName: coinbasePro.name,
            side: Side.Ask,
            pair,
            price: 2000,
            amount: 1
        });

        network.recordOrder({
            exchangeName: gemini.name,
            side: Side.Ask,
            pair,
            price: 1000,
            amount: 1
        });

        let bestAsk = network.getBestAskFor(pair);

        Expect(bestAsk.exchange).toBe(gemini);
        Expect(bestAsk.price).toEqual(1000);
    }

    @Test("getBestAskFor > no new best")
    public getBestAskForNoNewBestTest() {
        let pair: Pair = { base: "BTC", quote: "USD" };
        let network = new ExchangeNetwork();
        let coinbasePro = network.addExchange("Coinbase Pro");
        let gemini = network.addExchange("Gemini");

        coinbasePro.addMarket(pair);
        gemini.addMarket(pair);

        network.recordOrder({
            exchangeName: coinbasePro.name,
            side: Side.Ask,
            pair,
            price: 1000,
            amount: 1
        });

        network.recordOrder({
            exchangeName: gemini.name,
            side: Side.Ask,
            pair,
            price: 1000,
            amount: 1
        });

        let bestAsk = network.getBestAskFor(pair);

        Expect(bestAsk.exchange).toBe(coinbasePro);
        Expect(bestAsk.price).toEqual(1000);
    }

    @Test("getBestAskFor > min amount")
    public getBestAskForMinAmountTest() {
        let pair: Pair = { base: "BTC", quote: "USD" };
        let network = new ExchangeNetwork();
        let coinbasePro = network.addExchange("Coinbase Pro");
        let gemini = network.addExchange("Gemini");

        coinbasePro.addMarket(pair);
        gemini.addMarket(pair);

        network.recordOrder({
            exchangeName: coinbasePro.name,
            side: Side.Ask,
            pair,
            price: 1000,
            amount: 1
        });

        network.recordOrder({
            exchangeName: gemini.name,
            side: Side.Ask,
            pair,
            price: 1000,
            amount: 2
        });

        let bestAsk = network.getBestAskFor(pair, 2);

        Expect(bestAsk.exchange).toBe(gemini);
        Expect(bestAsk.price).toEqual(1000);
    }
}