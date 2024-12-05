import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/04.txt")).trim()
const parse = sss.array(/\r?\n/)
const grid = parse(puzzleInput)

function countMatches(matcher: (row: number, col: number) => number) {
  let count = 0;
  for (let row = 0; row < grid.length; row++)
    for (let col = 0; col < grid[row].length; col++)
      count += matcher(row, col);
  return count
}

function findXmasAt(row: number, col: number) {
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

console.log("Part 1:", countMatches(findXmasAt));

function findMasXAt(row: number, col: number) {
  // Only look at positions where there is an 'A' as the center of the Mas-X
  if (grid[row][col] !== 'A') return 0;

  // Check for MAS or SAM on each axis of the X
  const axis1 =
    (grid[row-1]?.[col-1] === 'M' && grid[row+1]?.[col+1] === 'S') ||
    (grid[row-1]?.[col-1] === 'S' && grid[row+1]?.[col+1] === 'M');

  const axis2 =
    (grid[row-1]?.[col+1] === 'M' && grid[row+1]?.[col-1] === 'S') ||
    (grid[row-1]?.[col+1] === 'S' && grid[row+1]?.[col-1] === 'M');

  // Both axes must exist for this to count
  return axis1 && axis2 ? 1 : 0
}

console.log("Part 2:", countMatches(findMasXAt));
