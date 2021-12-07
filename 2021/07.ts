import { map, max, min, range, sum } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, pop$, then } from "../lib/streams.ts";

const crabs = await pipe(
  getLines("07.input.txt"),
  pop$,
  then((s) => s.split(",").map(Number)),
);

const minPosition = pipe(crabs, min);
const maxPosition = pipe(crabs, max);

const linearDistance = (a: number, b: number) => Math.abs(a - b);
const triangularDistance = (a: number, b: number) => {
  const n = linearDistance(a, b);
  return n * (n + 1) / 2;
};

const fuelUsage = (
  crabs: number[],
  targetPos: number,
  distance: (a: number, b: number) => number,
) =>
  pipe(
    crabs,
    map((c) => distance(c, targetPos)),
    sum,
  );

const part1Fuel = pipe(
  range(minPosition, maxPosition),
  map((p) => fuelUsage(crabs, p, linearDistance)),
  min,
);

console.log("Part 1:", part1Fuel);

const part2Fuel = pipe(
  range(minPosition, maxPosition),
  map((p) => fuelUsage(crabs, p, triangularDistance)),
  min,
);

console.log("Part 2:", part2Fuel);
