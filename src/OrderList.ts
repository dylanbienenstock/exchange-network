import { Side, Order, OrderNode, AggregatedOrder } from "./types";

export class OrderList {
    public head: OrderNode;
    public tail: OrderNode;
    public length: number;

    constructor(private side: Side) {
        this.length = 0;
    }

    public record(order: Order): void {
        this.length += ((): number => {
            if (order.amount == 0) return this.delete(order.price);

            let node = this.createNode(order);

            if (this.length == 0) return this.insertInitialNode(node);
        
            let seqNode = this.findSequentialNode(node);

            if (!seqNode) return this.insertNodeBeforeHead(node);

            if (seqNode.price == node.price) return this.updateNode(seqNode, order.amount);

            return this.insertNodeAfter(node, seqNode);
        })();
    }

    private createNode(order: Order): OrderNode {
        return { 
            price: order.price,
            amount: [order.amount]
        };
    }

    private insertInitialNode(node: OrderNode): number {
        this.head = node;
        this.tail = node;
        return 1;
    }

    private findSequentialNode(beforeNode: OrderNode): OrderNode {
        let node = this.tail;
        let found = false;

        while (node && !found) {
            found = this.side == Side.Bid
                ? (node.price <= beforeNode.price)
                : (node.price >= beforeNode.price);

            if (found) break;

            node = node.prev;
        }

        if (!found) return null;

        return node;
    }

    private insertNodeBeforeHead(node: OrderNode): number {
        node.next = this.head;
        this.head.prev = node;
        this.head = node;
        return 1;
    }

    private insertNodeAfter(insertNode: OrderNode, afterNode: OrderNode): number {
        if (afterNode === this.tail) {
            this.tail.next = insertNode;
            insertNode.prev = this.tail;
            this.tail = insertNode;
        } else {
            insertNode.next = afterNode.next;
            insertNode.next.prev = insertNode;
            afterNode.next = insertNode;
            insertNode.prev = afterNode;
        }

        return 1;
    }

    private updateNode(node: OrderNode, amount: number): number {
        node.amount.push(amount);
        return 0;
    }
    
    public delete(price: number): number {
        if (this.length == 0) return 0;
        
        let node = this.tail;
        let found = false;

        while (node && !found) {
            if (node.price == price) {
                found = true;
                break;
            }

            node = node.prev;
        }
        
        if (!found) return 0;

        if (node == this.head)
        {            
            this.head = this.head.next;
            this.head.prev = null;
        }
        else if (node == this.tail)
        {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        else
        {
            node.next.prev = node.prev;
            node.prev.next = node.next;
        }

        return -1;
    }

    public toArray(): AggregatedOrder[] {
        let arr: AggregatedOrder[] = [];
        let node = this.head;

        while (node) {
            arr.push({
                price: node.price,
                amount: node.amount
            });

            node = node.next;
        }

        return arr;
    }
}