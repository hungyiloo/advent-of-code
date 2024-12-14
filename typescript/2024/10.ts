import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/10.txt")).trim();

const parse = sss.grid(/\r?\n/, '', Number)
const grid = parse(puzzleInput)
const gridMaxRow = grid.length - 1
const gridMaxCol = grid[0].length - 1

function walk(start: [number, number]) {
  if (grid[start[0]][start[1]] !== 0) return { trails: 0, summits: 0 }

  const summited = new Set<string>()

  function step(row: number, col: number) {
    const height = grid[row][col]
    if (height === 9) {
      summited.add(`${row},${col}`)
      return 1
    } else {
      const oneLevelHigher = height + 1
      let trails = 0
      if (grid[row+1]?.[col] === oneLevelHigher) trails += step(row+1, col)
      if (grid[row-1]?.[col] === oneLevelHigher) trails += step(row-1, col)
      if (grid[row]?.[col+1] === oneLevelHigher) trails += step(row, col+1)
      if (grid[row]?.[col-1] === oneLevelHigher) trails += step(row, col-1)
      return trails
    }
  }

  const trails = step(...start)
  return { trails, summits: summited.size }
}

function* allPoints() { 
  for (let row = 0; row <= gridMaxRow; row++) 
    for (let col = 0; col <= gridMaxCol; col++) 
      yield [row, col] as [number, number]
}

console.log("Part 1:", allPoints().reduce((s, p) => s + walk(p).summits, 0))
console.log("Part 2:", allPoints().reduce((s, p) => s + walk(p).trails, 0))
