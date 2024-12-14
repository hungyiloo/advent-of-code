import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/10.txt")).trim();

const parse = sss.grid(/\r?\n/, '', Number)
const grid = parse(puzzleInput)
const gridMaxRow = grid.length - 1
const gridMaxCol = grid[0].length - 1

function walk(row: number, col: number, allPossibleTrails = false): number {
  if (grid[row][col] !== 0) return 0

  const summits = new Set<string>()

  function inner(row: number, col: number) {
    const height = grid[row][col]
    if (height === 9) {
      summits.add(String([row, col]))
      return 1
    } else {
      const oneLevelHigher = height + 1
      let trails = 0
      if (grid[row+1]?.[col] === oneLevelHigher) trails += inner(row+1, col)
      if (grid[row-1]?.[col] === oneLevelHigher) trails += inner(row-1, col)
      if (grid[row]?.[col+1] === oneLevelHigher) trails += inner(row, col+1)
      if (grid[row]?.[col-1] === oneLevelHigher) trails += inner(row, col-1)
      return trails
    }
  }

  const trails = inner(row, col)
  return allPossibleTrails ? trails : summits.size
}

let part1 = 0
for (let row = 0; row <= gridMaxRow; row++) 
  for (let col = 0; col <= gridMaxCol; col++) 
    part1 += walk(row, col)

console.log("Part 1:", part1)

let part2 = 0
for (let row = 0; row <= gridMaxRow; row++) 
  for (let col = 0; col <= gridMaxCol; col++) 
    part2 += walk(row, col, true)

console.log("Part 2:", part2)
