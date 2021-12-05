import { range } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, map, toArray } from "../lib/streams.ts";

type Point = [number, number];
interface Line {
  start: Point;
  end: Point;
}

const lines = await pipe(
  getLines("05.input.txt"),
  map((line) => line.split(" -> ")),
  map((points) => points.map((p) => p.split(",").map(Number))),
  map(([start, end]) => ({ start, end } as Line)),
  toArray,
);

const makeGrid = (size: number) => range(size).map(() => range(size).fill(0));

const isHorizontal = (line: Line) => line.start[1] === line.end[1];
const isVertical = (line: Line) => line.start[0] === line.end[0];

function plotPoint(grid: number[][], point: Point) {
  grid[point[1]][point[0]]++;
}

function plotLine(grid: number[][], line: Line) {
  const xs = range(line.start[0], line.end[0], true);
  const ys = range(line.start[1], line.end[1], true);
  // iterate through the longer sequence of x or y values
  // (the other one MUST be a single value, as part of AoC conditions)
  range(Math.max(xs.length, ys.length))
    .forEach((i) =>
      plotPoint(grid, [
        xs.length === 1 ? xs[0] : xs[i],
        ys.length === 1 ? ys[0] : ys[i],
      ])
    );
}

function plotLines(grid: number[][], lines: Line[], diagonals?: boolean) {
  if (!diagonals) {
    lines = lines.filter((line) => isHorizontal(line) || isVertical(line));
  }
  lines.forEach((line) => plotLine(grid, line));
}

function scoreGrid(grid: number[][]) {
  return grid
    .flatMap((r) => r)
    .reduce((acc, curr) => acc + (curr > 1 ? 1 : 0), 0);
}

const part1Grid = makeGrid(1000);
plotLines(part1Grid, lines);
console.log("Part 1:", scoreGrid(part1Grid));

const part2Grid = makeGrid(1000);
plotLines(part2Grid, lines, true);
console.log("Part 2:", scoreGrid(part2Grid));
