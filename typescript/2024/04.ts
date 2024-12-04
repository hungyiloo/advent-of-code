import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/04.txt")).trim()
const parse = sss.array(/\r?\n/)
const grid = parse(puzzleInput)

function findXmasAt(row: number, col: number): number {
  // Only look at positions where there is an 'X'
  if (grid[row][col] !== 'X') return 0;

  let count = 0;

  // Search in all 8 directions around the X for the remaining 'MAS' and count matches
  if (grid[row]?.[col+1] === 'M' && grid[row]?.[col+2] === 'A' && grid[row]?.[col+3] === 'S') count++;
  if (grid[row]?.[col-1] === 'M' && grid[row]?.[col-2] === 'A' && grid[row]?.[col-3] === 'S') count++;
  if (grid[row+1]?.[col] === 'M' && grid[row+2]?.[col] === 'A' && grid[row+3]?.[col] === 'S') count++;
  if (grid[row-1]?.[col] === 'M' && grid[row-2]?.[col] === 'A' && grid[row-3]?.[col] === 'S') count++;
  if (grid[row+1]?.[col+1] === 'M' && grid[row+2]?.[col+2] === 'A' && grid[row+3]?.[col+3] === 'S') count++;
  if (grid[row-1]?.[col-1] === 'M' && grid[row-2]?.[col-2] === 'A' && grid[row-3]?.[col-3] === 'S') count++;
  if (grid[row+1]?.[col-1] === 'M' && grid[row+2]?.[col-2] === 'A' && grid[row+3]?.[col-3] === 'S') count++;
  if (grid[row-1]?.[col+1] === 'M' && grid[row-2]?.[col+2] === 'A' && grid[row-3]?.[col+3] === 'S') count++;

  return count;
}

let part1 = 0;
for (let row = 0; row < grid.length; row++)
  for (let col = 0; col < grid[row].length; col++)
    part1 += findXmasAt(row, col);
console.log("Part 1:", part1);

function findMasXAt(row: number, col: number): boolean {
  // Only look at positions where there is an 'A' as the center of the Mas-X
  if (grid[row][col] !== 'A') return false;

  // Check for MAS or SAM on each axis of the X
  const axis1 =
    (grid[row-1]?.[col-1] === 'M' && grid[row+1]?.[col+1] === 'S') ||
    (grid[row-1]?.[col-1] === 'S' && grid[row+1]?.[col+1] === 'M');

  const axis2 =
    (grid[row-1]?.[col+1] === 'M' && grid[row+1]?.[col-1] === 'S') ||
    (grid[row-1]?.[col+1] === 'S' && grid[row+1]?.[col-1] === 'M');

  // Both axes must exist for this to count
  return axis1 && axis2
}

let part2 = 0;
for (let row = 0; row < grid.length; row++)
  for (let col = 0; col < grid[row].length; col++)
    if (findMasXAt(row, col))
      part2++
console.log("Part 2:", part2);
