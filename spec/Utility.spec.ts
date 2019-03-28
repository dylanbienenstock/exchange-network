import { TestFixture, Test, TestCase, Expect } from "alsatian";
import { Pair } from "../src/types";
import { pairToString } from "../src/Utility";

@TestFixture("Utilities")
export class UtilityTests {

    @TestCase({ base: "BTC", quote: "USD" }, "BTC/USD")
    @TestCase({ base: "ETH", quote: "BTC" }, "ETH/BTC")
    @TestCase({ base: "CAD", quote: "USD" }, "CAD/USD")
    @Test("pairToString")
    public pairToStringTest(pair: Pair, expectedStr: string) {
        let str = pairToString(pair);

        Expect(str).toEqual(expectedStr);
    }
}