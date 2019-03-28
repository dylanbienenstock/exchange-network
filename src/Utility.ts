import { Pair } from "./types";

export function pairToString(pair: Pair): string {
    return [pair.base, pair.quote]
        .map(c => c.toString().toUpperCase())
        .join("/");
}