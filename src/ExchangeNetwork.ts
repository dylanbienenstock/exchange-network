import { Exchange } from "./Exchange";
import { Pair, Market, ExchangeOrder, Side, InterexchangeBest } from "./types";
import { pairToString } from "./Utility";

export class ExchangeNetwork {
    private exchanges: Map<string, Exchange>;

    constructor() {
        this.exchanges = new Map<string, Exchange>();
    }

    public addExchange(name: string): Exchange {
        if (this.exchanges.has(name))
            this.throwError(name, "already exists");

        let exchange = new Exchange(name);

        this.exchanges.set(name, exchange);

        return exchange;
    }

    public deleteExchange(name: string): void {
        this.exchanges.delete(name);
    }

    public getExchange(name: string): Exchange {
        return this.exchanges.get(name);
    }

    public getMarket(exchangeName: string, pair: Pair): Market {
        let exchange = this.getExchange(exchangeName);

        if (!exchange) throw new Error(`Exchange "${name}" does not exist`);

        let market = exchange.getMarket(pair);

        if (!market) {
            let marketKey = pairToString(pair);
            let marketErrorPrefix = `Market "${marketKey}" @ Exchange "${exchangeName}"`;

            throw new Error(`${marketErrorPrefix} does not exist`);
        }

        return market;
    }

    public getAllMarketsFor(pair: Pair) {
        let markets: Market[] = [];

        this.exchanges.forEach(ex => {
            markets.push(ex.getMarket(pair))
        });

        return markets.filter(m => m != undefined);
    }

    public deleteAllMarketsFor(pair: Pair) {
        this.exchanges.forEach(ex => {
            ex.deleteMarket(pair)
        }); 
    }

    public recordOrder(order: ExchangeOrder): void {
        let market = this.getMarket(order.exchangeName, order.pair);

        market.orderBook.record({
            side: order.side,
            price: order.price,
            amount: order.amount
        });
    }

    public deleteOrder(price: number, exchangeName: string, pair: Pair, side: Side): void {
        let market = this.getMarket(exchangeName, pair);

        market.orderBook.delete(price, side);
    }

    public getBestPriceFor(pair: Pair, side: Side, minimumAmount: number = 0): InterexchangeBest {
        let worstPricePossible = (side == Side.Bid)
            ? -Infinity
            :  Infinity;

        let best: InterexchangeBest = {
            exchange: null,
            price: worstPricePossible,
            amount: 0
        };

        let markets = this.getAllMarketsFor(pair);

        if (markets.length == 0) {
            let pairKey = pairToString(pair);

            throw new Error(`Market "${pairKey}" does not exist on any exchanges`);
        }
        
        markets.forEach(market => {
            let order = market.orderBook.getBestPrice(side);
            let newBest = (order.amount >= minimumAmount) && (
                side == Side.Bid
                    ? order.price > best.price
                    : order.price < best.price
            );

            if (!newBest) return;
            
            best.exchange = market.exchange;
            best.price = order.price;
            best.amount = order.amount;
        });

        return best;
    }

    public getBestBidFor(pair: Pair): InterexchangeBest {
        return this.getBestPriceFor(pair, Side.Bid);
    }

    public getBestAskFor(pair: Pair): InterexchangeBest {
        return this.getBestPriceFor(pair, Side.Ask);
    }

    private throwError(name: string, err: string) {
        throw new Error(`Exchange "${name}" ${err}`)
    }
}