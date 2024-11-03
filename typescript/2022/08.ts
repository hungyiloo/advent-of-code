const puzzleInput = (await Deno.readTextFile("../../input/2022/08.txt")).trim();

// The forest of tree heights
const FOREST = puzzleInput
  .split(/\r?\n/)
  .map(row => row
    .split('')
    .map(n => parseInt(n)))

// Some measurements of the forest size
const ROWS = FOREST.length
const LAST_ROW = ROWS - 1;
const COLS = FOREST[0].length;
const LAST_COL = COLS - 1;

type Direction = 'up' | 'down' | 'left' | 'right';

// Gets a string of coordinates in a given direction
// and from a particular point, to the edge
const lineOfSight = (
  row: number,
  col: number,
  direction: Direction
) => {
  switch (direction) {
    case 'up':
      return Array(row)
        .fill(row)
        .map((x, y) => [x-y-1, col]);
    case 'down':
      return Array(LAST_ROW - row)
        .fill(row)
        .map((x, y) => [x+y+1, col]);
    case 'left':
      return Array(col)
        .fill(col)
        .map((x, y) => [row, x-y-1]);
    case 'right':
      return Array(LAST_COL - col)
        .fill(col)
        .map((x, y) => [row, x+y+1]);
  }
}

// Look in a direction from a given point to see
// if it's blocked and how many trees you can see
const look = (
  row: number,
  col: number,
  direction: Direction
) => {
  const sight = lineOfSight(row, col, direction);
  const tree = FOREST[row][col];
  const blockedAt = sight.findIndex(([ii, jj]) => FOREST[ii][jj] >= tree);
  const blocked = blockedAt !== -1;
  const distance = blocked ? blockedAt + 1 : sight.length;
  return { blocked, distance };
}

// The coordinates of every tree in the forest
const EVERY_TREE = Array(ROWS)
  .fill(0)
  .flatMap((_, row) => Array(COLS)
    .fill(0)
    .map((_, col) => [row, col]));

// Survey the whole forest by looking around
// at every tree coordinate
const SURVEY = EVERY_TREE
  .map(([row, col]) => ({
    up: look(row, col, 'up'),
    left: look(row, col, 'left'),
    right: look(row, col, 'right'),
    down: look(row, col, 'down'),
  }));

// Count the trees that are visible in some direction
const part1 = SURVEY
  .filter(({ up, left, right, down }) =>
    !up.blocked || !left.blocked || !right.blocked || !down.blocked
  ).length;

// Score the trees by the distance in every direction
// and find the highest score.
const part2 = Math.max(
  ...SURVEY.map(({ up, left, right, down }) =>
    up.distance * left.distance * right.distance * down.distance
  )
);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
