import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/06.txt")).trim();
const parse = sss.array(/\r?\n/, sss.array(""));
const grid = parse(puzzleInput);
const gridMaxRow = grid.length - 1
const gridMaxCol = grid[0].length - 1

enum EntityType {
  Guard = "^",
  Obstacle = "#",
  Empty = ".",
}
type Entity = {
  type: EntityType;
  position: [number, number]
};
const entities = grid.flatMap((line, row) =>
  line.map((cell, col) => ({ type: cell, position: [row, col] }) as Entity),
);
const guard = entities.find((e) => e.type === EntityType.Guard)!;
const obstacles = entities.filter((e) => e.type === EntityType.Obstacle);
const spaces = entities.filter((e) => e.type === EntityType.Empty);

enum Direction { Left, Right, Up, Down }

const DirectionVectors: Record<Direction, [number, number]> = {
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

function step(pos: [number, number], vector: [number, number]): 'exit' | 'blocked' | [number, number] {
  const row = pos[0] + vector[0]
  const col = pos[1] + vector[1]
  if (row < 0 || row > gridMaxRow || col < 0 || col > gridMaxCol) {
    return 'exit'
  } else if (obstacles.find(o => o.position[0] === row && o.position[1] === col)) {
    return 'blocked'
  } else {
    return [row, col]
  }
}

function simulate() {
  let pos = guard.position
  let direction = Direction.Up
  let nextPos = step(pos, DirectionVectors[direction])
  let loop = false
  const visited = new Set([String(pos)])
  const blockedAt = new Set<string>()
  let lastBlockedAt = ''

  while (nextPos !== 'exit') {
    const posKey = String(pos)
    if (nextPos === 'blocked') {
      if (lastBlockedAt !== posKey && blockedAt.has(posKey)) {
        loop = true
        break
      }
      blockedAt.add(posKey)
      lastBlockedAt = posKey
      direction = turn(direction)
    } else {
      pos = nextPos
      visited.add(posKey)
    }
    nextPos = step(pos, DirectionVectors[direction])
  }

  return { visited, loop }
}

console.log("Part 1:", simulate().visited.size)

function rewritableLog(message?: string, maxLength = 25) { 
  Deno.stdout.writeSync(new TextEncoder().encode(new Array(maxLength).fill('\b').join(''))) 
  if (message) {
    Deno.stdout.writeSync(new TextEncoder().encode(message.padEnd(maxLength, ' '))) 
  }
}

rewritableLog("Searching for loops...")
let loopCount = 0
for (const space of spaces) {
  obstacles.push({ type: EntityType.Obstacle, position: space.position })
  if (simulate().loop) { 
    loopCount++
    rewritableLog(`Searching... (${loopCount})`)
  }
  obstacles.pop()
}

rewritableLog(new Array(25).fill(' ').join(''))
rewritableLog()
console.log("Part 2:", loopCount)
