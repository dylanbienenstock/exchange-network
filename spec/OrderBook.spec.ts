import { Expect, Test, TestFixture, TestCase } from "alsatian";
import { recordTestCases } from "./OrderList.data.spec";
import { OrderBook, Side } from "../src/types";

@TestFixture("OrderBook")
export class OrderBookTests {
    public _recordTest(testName: string) {
        let testCase = recordTestCases[testName];
        let orderBook = new OrderBook();

        testCase.input.forEach(order => {
            orderBook.record({
                ...order,
                side: testCase.side
            });
        });

        let actual = orderBook.getList(testCase.side).toArray();

        Expect(actual.length).toEqual(testCase.expected.length);

        testCase.expected.forEach((expected, i) => {
            Expect(actual[i].price).toEqual(expected.price);
            Expect(actual[i].amount).toEqual(expected.amount);
        });
        
        return orderBook;
    }

    @TestCase(Side.Bid)
    @TestCase(Side.Ask)
    @Test("getList")
    public getListTest(side: Side) {
        let orderBook = new OrderBook();
        let actual = orderBook.getList(side);
        let expected = (side == Side.Bid)
            ? orderBook.bids
            : orderBook.asks;

        Expect(actual).toBe(expected);
    }

    @Test("record > insert")
    public recordInsertTest() { this._recordTest("insertion"); }

    @Test("record > delete")
    public recordDeleteTest() { this._recordTest("deletion"); }

    @Test("record > update")
    public recordUpdateTest() { this._recordTest("update"); }

    @TestCase("insertion", 6000, 3)
    @TestCase("update", 2500, 1)
    @Test("delete")
    public deleteTest(recordTest: string, deletePrice: number, expectedLength: number) {
        let testCase = recordTestCases[recordTest];
        let orderBook = this._recordTest(recordTest);

        orderBook.delete(deletePrice, testCase.side);

        let orderArr = orderBook.getList(testCase.side).toArray();

        Expect(orderArr.length).toEqual(expectedLength);
    }

    @TestCase("insertion", 6000)
    @TestCase("update", 2500)
    @Test("getBestPrice")
    public getBestPriceTest(recordTest: string, expectedBestPrice: number) {
        let testCase = recordTestCases[recordTest];
        let orderBook = this._recordTest(recordTest);
        let bestPrice = orderBook.getBestPrice(testCase.side).price;

        Expect(bestPrice).toEqual(expectedBestPrice);
    }

    @Test("getBestBid")
    public getBestBidTest() {
        let orderBook = this._recordTest("insertion");
        let bestBid = orderBook.getBestBid().price;

        Expect(bestBid).toEqual(6000);
    }

    @Test("getBestAsk")
    public getBestAskTest() {
        let orderBook = this._recordTest("update");
        let bestAsk = orderBook.getBestAsk().price;

        Expect(bestAsk).toEqual(2500);
    }

    @Test("getSpread")
    public getSpreadTest() {
        let orderBook = new OrderBook();

        orderBook.record({
            side: Side.Bid,
            price: 1000,
            amount: 1
        });

        orderBook.record({
            side: Side.Ask,
            price: 1500,
            amount: 1
        });

        let spread = orderBook.getSpread();

        Expect(spread).toEqual(500);
    }
}
