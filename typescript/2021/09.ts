import { map, product, sort, sum, take } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, map$, toArray$ } from "../lib/streams.ts";

const heightMap = await pipe(
  getLines("../../input/2021/09.txt"),
  map$((line) => line.split("").map(Number)),
  toArray$,
);

interface Coordinate {
  y: number;
  x: number;
}

interface Point extends Coordinate {
  height: number;
}

const getNeighbors = ({ y, x }: Coordinate) =>
  [[y - 1, x], [y + 1, x], [y, x - 1], [y, x + 1]].reduce(
    (acc, [y, x]) => {
      if (y >= 0 && y < heightMap.length && x >= 0 && x < heightMap[y].length) {
        acc.push({ y, x, height: heightMap[y][x] });
      }
      return acc;
    },
    [] as Point[],
  );

const findLowPoints = () => {
  const lowPoints: Point[] = [];
  for (let y = 0; y < heightMap.length; y++) {
    for (let x = 0; x < heightMap[y].length; x++) {
      const height = heightMap[y][x];
      const neighbors = getNeighbors({ y, x });
      if (neighbors.every((neighbor) => neighbor.height > height)) {
        lowPoints.push({ y, x, height });
      }
    }
  }
  return lowPoints;
};

const riskLevel = (point: Point) => point.height + 1;

const hashCoordinate = ({ y, x }: Coordinate) => Symbol.for(`${y}:${x}`);

const findBasin = (
  coord: Coordinate,
  basin?: Set<symbol>,
) => {
  if (!basin) basin = new Set();
  basin.add(hashCoordinate(coord));
  for (const neighbor of getNeighbors(coord)) {
    const p = hashCoordinate(neighbor);
    if (neighbor.height < 9 && !basin.has(p)) {
      basin.add(p);
      findBasin(neighbor, basin);
    }
  }
  return basin;
};

const part1 = pipe(
  heightMap,
  findLowPoints,
  map(riskLevel),
  sum,
);
console.log("Part 1:", part1);

const part2 = pipe(
  heightMap,
  findLowPoints,
  map((point) => findBasin(point).size),
  sort((a, b) => b - a),
  take(3),
  product,
);
console.log("Part 2:", part2);
