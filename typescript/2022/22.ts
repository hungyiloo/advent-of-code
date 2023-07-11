const puzzleInput = (await Deno.readTextFile("../../input/2022/22.txt"));
type Tile = ' ' | '.' | '#' | undefined
type Board = Tile[][]
type Rotation = 'R' | 'L' | undefined
type Move = { distance: number, rotation: Rotation }
type Position = [number, number]
type Vector = readonly [number, number]
const Direction = {
  Up: [-1, 0] as Vector,
  Down: [1, 0] as Vector,
  Right: [0, 1] as Vector,
  Left: [0, -1] as Vector
}
type State = { position: Position, direction: Vector }

function parseInput(): { board: Board, path: Move[] } {
  const [boardRaw, pathRaw] = puzzleInput.split('\n\n')
  const pathRegex = /(\d+)([RL]?)/g
  return {
    board: boardRaw.split('\n').map(line => line.split('')) as Board,
    path: [...pathRaw.matchAll(pathRegex)].map(m => ({ distance: m[1], rotation: m[2] } as unknown as Move))
  }
}

function getStartingState(board: Board): State {
  for (let y = 0; y < board.length; y++) {
    for(let x = 0; x < board[y].length; x++) {
      if (board[y][x] === '.') {
        return {
          position: [y, x],
          direction: Direction.Right
        }
      }
    }
  }
  throw new Error('Could not find starting state for given board')
}

function nextDirection(direction: Vector, rotation: Rotation): Vector {
  if (rotation === 'R') {
    switch (direction) {
      case Direction.Up: return Direction.Right
      case Direction.Right: return Direction.Down
      case Direction.Down: return Direction.Left
      case Direction.Left: return Direction.Up
      default: throw new Error(`Unknown current direction: ${direction}`)
    }
  } else if (rotation === 'L') {
    switch (direction) {
      case Direction.Up: return Direction.Left
      case Direction.Left: return Direction.Down
      case Direction.Down: return Direction.Right
      case Direction.Right: return Direction.Up
      default: throw new Error(`Unknown current direction: ${direction}`)
    }
  } else {
    return direction;
  }
}

function reducer(board: Board) {
  const maxRows = board.length
  const maxCols = board.reduce((max, r) => Math.max(max, r.length), 0)

  return (state: State, move: Move): State => {
    const { direction } = state
    const { distance, rotation } = move
    let steps = 0;
    let position = state.position
    while (steps < distance) {
      const [dy, dx] = direction
      let [y, x] = position
      let tile: Tile;
      do {
        y = (y + dy + maxRows) % maxRows
        x = (x + dx + maxCols) % maxCols
        tile = board[y][x]
      } while (tile === ' ' || tile === undefined)
      if (tile === '.') {
        position = [y, x]
      } else if (tile === '#') {
        break;
      } else {
        throw new Error(`On an unexpected tile ${tile} at position ${[y, x]}`)
      }
      steps++;
    }
    return {
      position,
      direction: nextDirection(direction, rotation)
    }
  }
}

function score(state: State) {
  const { position: [y, x], direction } = state
  const directionIndex = new Map([
    [Direction.Right, 0],
    [Direction.Down, 1],
    [Direction.Left, 2],
    [Direction.Up, 3]
  ]).get(direction)!
  return 1000*(y + 1) + 4*(x + 1) + directionIndex
}

function simulate() {
  const { board, path } = parseInput()
  const state = getStartingState(board)
  const finalState = path.reduce(reducer(board), state)
  return score(finalState)
}

console.log("Part 1:", simulate())
