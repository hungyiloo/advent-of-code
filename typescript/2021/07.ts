import { map, max, min, range, sum } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, pop$, then } from "../lib/streams.ts";

const crabs = await pipe(
  getLines("../../input/2021/07.txt"),
  pop$,
  then((s) => s.split(",").map(Number)),
);

type DistanceMeasure = (a: number) => (b: number) => number;

const linearDistance: DistanceMeasure = (a) => (b) => Math.abs(a - b);
const triangularDistance: DistanceMeasure = (a) => (b) => {
  const n = linearDistance(a)(b);
  return n * (n + 1) / 2;
};

function fuelUsage(targetPos: number, measureDistance: DistanceMeasure) {
  return pipe(
    crabs,
    map(measureDistance(targetPos)),
    sum,
  );
}

function leastFuel(measureDistance: DistanceMeasure) {
  return pipe(
    range(min(crabs), max(crabs)),
    map((targetPos) => fuelUsage(targetPos, measureDistance)),
    min,
  );
}

console.log("Part 1:", leastFuel(linearDistance));
console.log("Part 2:", leastFuel(triangularDistance));
