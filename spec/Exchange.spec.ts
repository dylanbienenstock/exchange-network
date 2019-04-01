import { TestFixture, Test, TestCase, Expect } from "alsatian";
import { Market, Pair, Exchange, Side } from "../src/index";
import { testPairs } from "./Exchange.data.spec";
import { recordTestCases } from "./OrderList.data.spec";
import { pairToString } from "../src/Utility";

@TestFixture("Exchange")
export class ExchangeTests {

    public _expectMarketToBeValid(market: Market, pair: Pair, exchange: Exchange): void {
        Expect(market).toBeDefined();
        Expect(market.pair.base).toEqual(pair.base);
        Expect(market.pair.quote).toEqual(pair.quote);
        Expect(market.exchange).toBe(exchange);
    }

    public _recordOrderTest(testCaseName: string, pair: Pair): Exchange {
        let testCase = recordTestCases[testCaseName];
        let exchange = new Exchange("Kraken");
        let market = exchange.addMarket(pair);

        testCase.input.forEach(_order => {
            exchange.recordOrder({
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

        return exchange;
    }

    @Test("addMarket")
    public addMarketTest(): void {
        testPairs.forEach(pair => {
            let exchange = new Exchange("Coinbase Pro");
            exchange.addMarket(pair);
    
            let marketKey = pairToString(pair);
            let market = exchange.markets.get(marketKey);
    
            this._expectMarketToBeValid(market, pair, exchange);
        });
    }

    @Test("addMarket > existing market")
    public addMarketFailureTest(): void {
        testPairs.forEach(pair => {
            let exchange = new Exchange("Sketchy Alleyway");
            exchange.addMarket(pair);
    
            let addMarketAgain = () => {
                exchange.addMarket(pair);
            }

            Expect(addMarketAgain).toThrow();
        });
    }


    @Test("deleteMarket")
    public deleteMarketTest(): void {
        testPairs.forEach(pair => {
            let exchange = new Exchange("NASDAQ");
            exchange.addMarket(pair);
            exchange.deleteMarket(pair);

            let marketKey = pairToString(pair);
            let marketExists = exchange.markets.has(marketKey);

            Expect(marketExists).toEqual(false);
        });
    }

    @Test("getMarket")
    public getMarketTest(): void {
        testPairs.forEach(pair => {
            let exchange = new Exchange("Gemini");
            exchange.addMarket(pair);
            let market = exchange.getMarket(pair);

            this._expectMarketToBeValid(market, pair, exchange);
        });
    }

    @Test("recordOrder")
    public recordOrderTest(): void {
        testPairs.forEach(pair => {
            this._recordOrderTest("insertion", pair);
        });
    }


    @Test("recordOrder > nonexistent market")
    public recordOrderFailureTest() {
        testPairs.forEach(pair => {
            let exchange = new Exchange("Sketchy Alleyway");
            
            let recordOrder = () => {
                exchange.recordOrder({
                    side: Side.Bid,
                    pair,
                    price: 404,
                    amount: 404
                });
            };

            Expect(recordOrder).toThrow();
        });
    }

    @TestCase(1000, 3)
    @TestCase(2500, 3)
    @TestCase(6000, 3)
    @TestCase(404, 4)
    @Test("deleteOrder")
    public deleteOrderTest(price: number, expectedLength: number): void {
        testPairs.forEach(pair => {
            let exchange = this._recordOrderTest("insertion", pair);
            let market = exchange.getMarket(pair);

            exchange.deleteOrder(price, {
                pair,
                side: Side.Bid
            });

            let orderArr = market.orderBook
                .getList(Side.Bid)
                .toArray();

            Expect(orderArr.length).toEqual(expectedLength);
        });
    }

    @Test("deleteOrder > nonexistent market")
    public deleteOrderFailureTest() {
        testPairs.forEach(pair => {
            let exchange = new Exchange("Sketchy Alleyway");
            
            let deleteOrder = () => {
                exchange.deleteOrder(404, { pair, side: Side.Bid });
            };

            Expect(deleteOrder).toThrow();
        });
    }
}