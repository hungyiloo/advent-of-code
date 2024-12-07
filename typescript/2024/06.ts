import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/06.txt")).trim();

type Position = [number, number]

const parse = sss.array(
  /\r?\n/,
  (line, row) => sss.array(
    '',
    (char, col) => ({
      type: char,
      position: [row, col] as Position
    })
  )(line)
);

const grid = parse(puzzleInput);
const gridMaxRow = grid.length - 1
const gridMaxCol = grid[0].length - 1
const entities = grid.flat();

enum Direction { Left, Right, Up, Down }

const DirectionVectors: Record<Direction, Position> = {
  [Direction.Left]: [0, -1],
  [Direction.Right]: [0, 1],
  [Direction.Up]: [-1, 0],
  [Direction.Down]: [1, 0]
}

function turn(direction: Direction) {
  switch (direction) {
    case Direction.Left: return Direction.Up;
    case Direction.Up: return Direction.Right;
    case Direction.Right: return Direction.Down;
    case Direction.Down: return Direction.Left;
  }
}

function step(pos: Position, direction: Direction, blocks: Position[]): 'exit' | 'blocked' | Position {
  const vector = DirectionVectors[direction]
  const row = pos[0] + vector[0]
  const col = pos[1] + vector[1]
  if (row < 0 || row > gridMaxRow || col < 0 || col > gridMaxCol) {
    return 'exit'
  } else if (blocks.find(b => b[0] === row && b[1] === col)) {
    return 'blocked'
  } else {
    return [row, col]
  }
}

function simulate(pos: Position, blocks: Position[]) {
  let direction = Direction.Up
  let nextPos = step(pos, direction, blocks)
  let loop = false
  const visited = new Set([String(pos)])
  const blockedAt = new Set<string>()
  let lastBlockedAt = ''

  while (nextPos !== 'exit') {
    if (nextPos === 'blocked') {
      if (lastBlockedAt !== String(pos) && blockedAt.has(String(pos))) {
        loop = true
        break
      }
      blockedAt.add(String(pos))
      lastBlockedAt = String(pos)
      direction = turn(direction)
    } else {
      pos = nextPos
      visited.add(String(pos))
    }
    nextPos = step(pos, direction, blocks)
  }

  return { visited, loop }
}

function stdout(message?: string, maxLength = 25) { 
  Deno.stdout.writeSync(new TextEncoder().encode(new Array(maxLength).fill('\b').join(''))) 
  if (message) {
    Deno.stdout.writeSync(new TextEncoder().encode(message.padEnd(maxLength, ' '))) 
  }
}

const guard = entities.find((e) => e.type === '^')!.position;
const obstacles = entities.filter((e) => e.type === '#').map(o => o.position);
const visited = simulate(guard, obstacles).visited
console.log("Part 1:", visited.size)

const potentialObstacles = entities
  .filter((e) => e.type === '.')
  .map(s => s.position)
  // Only positions visited in Part 1 need to be considered.
  // Why? Putting an obstacle where the guard never would have walked makes no difference!
  .filter(p => visited.has(String(p))); 

stdout("Searching for loops...")
let loopCount = 0
for (const potentialObstacle of potentialObstacles) {
  if (simulate(guard, obstacles.concat([potentialObstacle])).loop) { 
    loopCount++
    stdout(`Searching... (${loopCount})`)
  }
}
stdout(new Array(25).fill(' ').join(''))
stdout()

console.log("Part 2:", loopCount)
