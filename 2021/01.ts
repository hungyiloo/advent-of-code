import { pipe } from "../lib/pipe.ts";
import { count, getLines, map, slidingWindow } from "../lib/streams.ts";

const sinkCountPart1 = await pipe(
  getLines("01.input.txt"),
  map(Number),
  slidingWindow(2), // pairwise
  count(([x, y]) => x < y), // count pairs that increase
);
console.log("Part 1:", sinkCountPart1);

const sinkCountPart2 = await pipe(
  getLines("01.input.txt"),
  map(Number),
  slidingWindow(3), // triplewise
  map((triple) => triple.reduce((a, x) => a + x)), // sum each triple
  slidingWindow(2), // pairwise
  count(([x, y]) => x < y), // count pairs that increase
);
console.log("Part 2:", sinkCountPart2);
