import { OrderList } from "./OrderList";
import { Side, BookOrder, Order, AggregatedOrder } from "./types";

export class OrderBook {
    public bids: OrderList;
    public asks: OrderList;

    constructor() {
        this.bids = new OrderList(Side.Bid);
        this.asks = new OrderList(Side.Ask);
    }

    public record(bookOrder: BookOrder) {
        let order: Order = {
            price: bookOrder.price,
            amount: bookOrder.amount
        };

        bookOrder.side == Side.Bid
            ? this.bids.record(order)
            : this.asks.record(order);
    }

    public delete(price: number, side: Side) {
        side == Side.Bid
            ? this.bids.delete(price)
            : this.asks.delete(price);
    }

    public getList(side: Side): OrderList {
        return side == Side.Bid
            ? this.bids
            : this.asks;
    }

    public getBestPrice(side: Side): Order {
        let order = (side == Side.Bid)
            ? this.bids.tail
            : this.asks.tail;

        return {
            price: order.price,
            amount: order.amount[order.amount.length - 1]
        };
    };

    public getBestBid(): Order { return this.getBestPrice(Side.Bid); };
    public getBestAsk(): Order { return this.getBestPrice(Side.Ask); };

    public getSpread(): number {
        let bestBid = this.getBestBid().price;
        let bestAsk = this.getBestAsk().price;

        return Math.abs(bestAsk - bestBid);
    }
}