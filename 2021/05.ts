import { range } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, map, reduce } from "../lib/streams.ts";

type Point = {
  x: number;
  y: number;
};
interface Line {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}
type Grid = Map<number, Map<number, number>>;

const isStraight = (l: Line) => l.x1 === l.x2 || l.y1 === l.y2;

const { straightLines, diagonalLines } = await pipe(
  getLines("05.input.txt"),
  map((line) => line.split(" -> ")),
  map((points) => points.map((p) => p.split(",").map(Number))),
  map(([[x1, y1], [x2, y2]]) => ({ x1, x2, y1, y2 } as Line)),
  reduce((acc, l) => {
    if (isStraight(l)) acc.straightLines.push(l);
    else acc.diagonalLines.push(l);
    return acc;
  }, { straightLines: [] as Line[], diagonalLines: [] as Line[] }),
);

function plotPoint(grid: Grid, point: Point) {
  const { x, y } = point;
  if (!grid.has(x)) grid.set(x, new Map<number, number>());
  const col = grid.get(x)!;
  col.set(y, (col.get(y) ?? 0) + 1);
}

function plotLine(grid: Grid, line: Line) {
  const xs = range(line.x1, line.x2, true);
  const ys = range(line.y1, line.y2, true);
  // iterate through the longer sequence of x or y values
  // (the other one MUST be a single value, as part of AoC conditions)
  range(Math.max(xs.length, ys.length))
    .forEach((i) =>
      plotPoint(grid, {
        x: xs.length === 1 ? xs[0] : xs[i],
        y: ys.length === 1 ? ys[0] : ys[i],
      })
    );
}

function plotLines(grid: Grid, lines: Line[]) {
  lines.forEach((line) => plotLine(grid, line));
}

function scoreGrid(grid: Grid) {
  return Array.from(grid.values())
    .flatMap((col) => Array.from(col.values()))
    .reduce((acc, curr) => acc + (curr > 1 ? 1 : 0), 0);
}

const grid = new Map<number, Map<number, number>>();
plotLines(grid, straightLines);
console.log("Part 1:", scoreGrid(grid));

plotLines(grid, diagonalLines);
console.log("Part 2:", scoreGrid(grid));
