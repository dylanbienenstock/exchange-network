import { Expect, Test, TestFixture, TestCase } from "alsatian";
import { OrderList } from "../src/OrderList";
import { recordTestCases } from "./OrderList.data.spec";

@TestFixture("OrderList")
export class OrderListTests {

    public _recordTest(testName: string) {
        let testCase = recordTestCases[testName];
        let orderList = new OrderList(testCase.side);

        testCase.input.forEach(order => {
            orderList.record(order);
        });

        let actual = orderList.toArray();

        Expect(actual.length).toEqual(testCase.expected.length);

        testCase.expected.forEach((expected, i) => {
            Expect(actual[i].price).toEqual(expected.price);
            Expect(actual[i].amount).toEqual(expected.amount);
        });
        
        return orderList;
    }
    
    @Test("record > insert")
    public recordInsertTest() { this._recordTest("insertion"); }

    @Test("record > delete")
    public recordDeleteTest() { this._recordTest("deletion"); }

    @Test("record > update")
    public recordUpdateTest() { this._recordTest("update"); }

    @TestCase(1000, 3)
    @TestCase(2500, 3)
    @TestCase(6000, 3)
    @TestCase(404, 4)
    @Test("delete")
    public deleteTest(price: number, expectedLength: number) {
        let orderList = this._recordTest("insertion");

        orderList.delete(price);

        let orderArr = orderList.toArray();

        Expect(orderArr.length).toEqual(expectedLength);
    }
}