import { Side, Order, AggregatedOrder } from "../src/types";

export type RecordTestCase = {
    side: Side;
    input: Order[]; 
    expected: AggregatedOrder[];
}; 

export const recordTestCases: { [testName: string]: RecordTestCase } = {
    "insertion": {
        side: Side.Bid,
        input: [
            { price: 4000, amount: 2 },
            { price: 6000, amount: 3 },
            { price: 1000, amount: 4 },
            { price: 2500, amount: 1 }
        ],
        expected: [
            { price: 1000, amount: [4] },            
            { price: 2500, amount: [1] },
            { price: 4000, amount: [2] },
            { price: 6000, amount: [3] }
        ]
    },
    "deletion": {
        side: Side.Bid,
        input: [
            { price: 2500, amount: 0 },
            { price: 4000, amount: 2 },
            { price: 6000, amount: 3 },
            { price: 2500, amount: 1 },
            { price: 6000, amount: 0 }
        ],
        expected: [
            { price: 2500, amount: [1] },
            { price: 4000, amount: [2] }
        ]
    },
    "update": {
        side: Side.Ask,
        input: [
            { price: 2500, amount: 0 },
            { price: 4000, amount: 2 },
            { price: 6000, amount: 3 },
            { price: 2500, amount: 1 },
            { price: 6000, amount: 0 },
            { price: 4000, amount: 5 },
            { price: 2500, amount: 3 },
            { price: 2500, amount: 2 }
        ],
        expected: [
            { price: 4000, amount: [2, 5] },
            { price: 2500, amount: [1, 3, 2] }
        ]
    }
}