import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/12.txt")).trim();

type Cell = {
  plant: string,
  row: number,
  col: number,
  neighbors: number,
  region?: number
}

const parse = sss.grid(
  /\r?\n/, 
  '',
  (plant, row, col) => ({ plant, row, col, neighbors: 0 } as Cell)
)
const grid = parse(puzzleInput)
const cells = grid.flat()

// Group into regions and count neighbors
function walk(cell: Cell, plant: string) {
  if (cell.region !== undefined) return
  cell.region = region
  const { row, col } = cell
  const neighbors = [
    grid[row+1]?.[col],
    grid[row-1]?.[col],
    grid[row]?.[col+1],
    grid[row]?.[col-1],
  ].filter(x => !!x)
  for (const neighbor of neighbors) {
    if (neighbor.plant === plant) {
      cell.neighbors++
      walk(neighbor, plant)
    }
  }
}

let region = 0
for (const cell of cells) {
  if (!cell.region) {
    walk(cell, cell.plant)
    region++
  }
}

const perimiters = cells.reduce(
  (acc, cell) => acc.set(cell.region!, (acc.get(cell.region!) ?? 0) + 4 - cell.neighbors),
  new Map<number, number>()
)

const areas = cells.reduce(
  (acc, cell) => acc.set(cell.region!, (acc.get(cell.region!) ?? 0) + 1),
  new Map<number, number>()
)

console.log(
  "Part 1:",
  areas.entries().reduce(
    (acc, [region, area]) => acc + area*perimiters.get(region)!,
    0
  )
)
