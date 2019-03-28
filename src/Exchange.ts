import { OrderBook } from "./OrderBook";
import { Pair, Market, MarketOrder, MarketOrderContext } from "./types";
import { pairToString } from "./Utility";

export class Exchange {
    public markets: Map<string, Market>;

    constructor(public name: string) {
        this.markets = new Map<string, Market>();
    }

    public addMarket(pair: Pair): Market {
        let key = pairToString(pair);

        if (this.markets.has(key))
            this.throwError(key, "already exists");

        let market: Market = {
            pair,
            exchange: this,
            orderBook: new OrderBook()
        };

        this.markets.set(key, market);

        return market;
    }

    public deleteMarket(pair: Pair): void {
        let key = pairToString(pair);

        this.markets.delete(key);
    }

    public getMarket(pair: Pair): Market {
        let key = pairToString(pair);

        return this.markets.get(key);
    }

    public recordOrder(order: MarketOrder): void {
        let key = pairToString(order.pair);
        let market = this.markets.get(key);

        if (!market) this.throwError(key, "does not exist");

        market.orderBook.record({
            side: order.side,
            price: order.price,
            amount: order.amount
        });
    }
    
    public deleteOrder(price: number, context: MarketOrderContext): void {
        let key = pairToString(context.pair);
        let market = this.markets.get(key);

        if (!market) this.throwError(key, "does not exist");

        market.orderBook.delete(price, context.side);
    }

    private throwError(key: string, err: string) {
        throw new Error(`Market "${key}" @ Exchange "${this.name}" ${err}`)
    }
}