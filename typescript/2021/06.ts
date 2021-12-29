import { memoize } from "../lib/functional.ts";
import { pipe } from "../lib/pipe.ts";
import { map, sum } from "../lib/array.ts";
import { getLines, pop$, then } from "../lib/streams.ts";

const fish = await pipe(
  getLines("../../input/2021/06.txt"),
  pop$,
  then((x) => x!.split(",").map(Number)),
);

const populationAt = memoize((days: number): number => {
  if (days <= 0) return 1;
  return populationAt(days - 7) + populationAt(days - 9);
});

const evolve = (fish: number[], days: number) =>
  pipe(
    fish,
    map((f) => populationAt(days - f)),
    sum,
  );

console.log("Part 1:", evolve(fish, 80));
console.log("Part 2:", evolve(fish, 256));
