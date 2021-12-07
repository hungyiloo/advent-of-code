import { map, max, min, range, sum } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, pop$, then } from "../lib/streams.ts";

const crabs = await pipe(
  getLines("07.input.txt"),
  pop$,
  then((s) => s.split(",").map(Number)),
);

const positionRange = [min(crabs), max(crabs)] as const;

type DistanceMeasure = (a: number) => (b: number) => number;

const linearDistance: DistanceMeasure = (a) => (b) => Math.abs(a - b);
const triangularDistance: DistanceMeasure = (a) => (b) => {
  const n = linearDistance(a)(b);
  return n * (n + 1) / 2;
};

function fuelUsage(targetPos: number, distanceTo: DistanceMeasure) {
  return pipe(
    crabs,
    map(distanceTo(targetPos)),
    sum,
  );
}

function solve(distance: DistanceMeasure) {
  return pipe(
    range(...positionRange),
    map((targetPos) => fuelUsage(targetPos, distance)),
    min,
  );
}

console.log("Part 1:", solve(linearDistance));
console.log("Part 2:", solve(triangularDistance));
