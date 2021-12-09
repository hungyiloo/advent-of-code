import { map, sum } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, map$, toArray$ } from "../lib/streams.ts";

const getNeighbors = (y: number, x: number, heightMap: number[][]) =>
  [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]].reduce((acc, [y, x]) => {
    const height = heightMap[y]?.[x];
    if (height !== undefined) {
      acc.push({ y, x, height });
    }
    return acc;
  }, [] as { x: number; y: number; height: number }[]);

const findLowPoints = (heightMap: number[][]) => {
  const lowPoints: number[] = [];
  for (let y = 0; y < heightMap.length; y++) {
    for (let x = 0; x < heightMap[y].length; x++) {
      const point = heightMap[y][x];
      const neighbors = getNeighbors(y, x, heightMap).map(n => n.height);
      if (neighbors.every((neighbor) => neighbor > point)) {
        lowPoints.push(point);
      }
    }
  }
  return lowPoints;
};

const riskLevel = (point: number) => point + 1;

const heightMap = await pipe(
  getLines("09.input.txt"),
  map$((line) => line.split("").map(Number)),
  toArray$,
);

const part1 = pipe(
  heightMap,
  findLowPoints,
  map(riskLevel),
  sum,
);
console.log("Part 1:", part1);
