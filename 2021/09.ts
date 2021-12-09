import { flatMap, map, product, sort, sum, take } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, map$, toArray$ } from "../lib/streams.ts";

const heightMap = await pipe(
  getLines("09.input.txt"),
  map$((line) => line.split("").map(Number)),
  toArray$,
);

interface Point { y: number; x: number; height: number }

const getNeighbors = (y: number, x: number) =>
  [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]].reduce((acc, [y, x]) => {
    const height = heightMap[y]?.[x];
    if (height !== undefined) {
      acc.push({ y, x, height });
    }
    return acc;
  }, [] as Point[]);

const findLowPoints = () => {
  const lowPoints: Point[] = [];
  for (let y = 0; y < heightMap.length; y++) {
    for (let x = 0; x < heightMap[y].length; x++) {
      const height = heightMap[y][x];
      const neighbors = getNeighbors(y, x);
      if (neighbors.every((neighbor) => neighbor.height > height)) {
        lowPoints.push({ y, x, height });
      }
    }
  }
  return lowPoints;
};

const riskLevel = (point: Point) => point.height + 1;

const part1 = pipe(
  heightMap,
  findLowPoints,
  map(riskLevel),
  sum,
);
console.log("Part 1:", part1);

const hashPoint = (y: number, x: number) => Symbol.for(`${y}:${x}`);

const searchBasin = (
  y: number,
  x: number,
  basin: Set<symbol>,
) => {
  getNeighbors(y, x).forEach(({ y, x, height }) => {
    const p = hashPoint(y, x);
    if (height < 9 && !basin.has(p)) {
      basin.add(p);
      searchBasin(y, x, basin);
    }
  });
  return basin;
};

const part2 = pipe(
  heightMap,
  findLowPoints,
  map((lowPoint) => searchBasin(lowPoint.y, lowPoint.x, new Set())),
  map(basin => basin.size),
  sort((a, b) => b - a),
  take(3),
  product
);
console.log("Part 2:", part2);
