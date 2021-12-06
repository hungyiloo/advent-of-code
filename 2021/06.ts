import { pipe } from "../lib/pipe.ts";
import { getLines, pop, then } from "../lib/streams.ts";

const fish = await pipe(
  getLines("06.input.txt"),
  pop,
  then((x) => x!.split(",").map(Number)),
);

// Iterative naive approach, full data structures, totally bombs for Part 2!
// Note: I left it in here to illustrate what doesn't work...
//
// function evolve(fish: number[], days: number) {
//   for (const _day of range(days)) {
//     let born = 0;
//     fish = fish.map((f) => {
//       f--;
//       if (f < 0) {
//         born++;
//         f = 6;
//       }
//       return f;
//     });
//     fish = fish.concat(range(born).map(() => 8));
//   }
//   return fish.length;
// }

// Exact same results as above, but recursive strategy and abandoning the fish
// data structure altogether allows many more generations without running out of
// resources.
//
// In fact, it works for >10,000 generations, at which point the population
// becomes so large that it's meaningless unless we go to BigInt.
function evolve2(fish: number[], days: number) {
  let e = (days: number): number =>
    days <= 0 ? 1 : e(days - 7) + e(days - 9); // magical recursion sauce
  e = memoize(e);
  return fish.map((f) => e(days - f)).reduce((acc, curr) => acc + curr, 0);
}

// Memoization allows for more efficient recursion
function memoize<T, U>(fn: (x: T) => U) {
  const memo = new Map<T, U>();
  return (x: T) => {
    if (memo.has(x)) return memo.get(x)!;
    const result = fn(x);
    memo.set(x, result);
    return result;
  };
}

// naive approach still works for Part 1
// console.log("Part 1:", evolve(fish, 80));
console.log("Part 1:", evolve2(fish, 80));
console.log("Part 2:", evolve2(fish, 256));
