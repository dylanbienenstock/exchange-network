import { OrderBook } from "./OrderBook";
import { Exchange } from "./Exchange";

export enum Side { Bid = "bid", Ask = "ask" };

export type Currency = string | number;
export type Pair = { base: Currency, quote: Currency };
export type Order = { price: number, amount: number };
export type AggregatedOrder = { price: number, amount: number[] };


export type BookOrderContext = { side: Side };
export type BookOrder = Order & BookOrderContext;

export type Market = { exchange?: Exchange, pair: Pair, orderBook: OrderBook };
export type MarketOrderContext = { side: Side, pair: Pair };
export type MarketOrder = Order & MarketOrderContext;

export type ExchangeOrderContext = { exchangeName: string, side: Side, pair: Pair };
export type ExchangeOrder = Order & ExchangeOrderContext;
export type InterexchangeBest = { exchange: Exchange, price: number, amount: number };

export interface OrderNode extends AggregatedOrder { prev?: OrderNode, next?: OrderNode }; 

export { OrderBook } from "./OrderBook";
export { OrderList } from "./OrderList";
export { Exchange } from "./Exchange";
export { ExchangeNetwork } from "./ExchangeNetwork";
