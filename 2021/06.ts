import { memoize } from "../lib/functional.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, pop, then } from "../lib/streams.ts";

const fish = await pipe(
  getLines("06.input.txt"),
  pop,
  then((x) => x!.split(",").map(Number)),
);

function evolve(fish: number[], days: number) {
  // calculates the popuation for a fish at 0 after given days
  let population = (days: number): number => {
    if (days <= 0) return 1;
    return population(days - 7) + population(days - 9); // magical recursion sauce
  };
  // memoize for perfomance
  population = memoize(population);
  return fish.reduce((s, f) => s + population(days - f), 0);
}

console.log("Part 1:", evolve(fish, 80));
console.log("Part 2:", evolve(fish, 256));

// What follows below is the iterative naive approach, full data structures,
// which totally bombs for Part 2 (would probably require >2TB memory)!
//
// I left it in here to illustrate what doesn't work...
//
// function naiveEvolve(fish: number[], days: number) {
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
//
// naive approach still works for Part 1, though
// console.log("Part 1:", naiveEvolve(fish, 80));
