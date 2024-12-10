import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/08.txt")).trim();

type Position = { row: number, col: number }
type Antenna = Position & { freq: string }

const parse = sss.grid(
  /\r?\n/,
  '',
  (freq, row, col) => ({ freq, row, col } as Antenna)
)

const grid = parse(puzzleInput)
const gridMaxRow = grid.length - 1
const gridMaxCol = grid[0].length - 1
const antennae = grid.flat().filter(e => e.freq !== '.')

function groupBy<T, K extends string | number>(arr: T[], keySelector: (x: T) => K) {
  return arr.reduce(
    (groups, curr) => {
      const key = keySelector(curr)
      return groups.set(key, (groups.get(key) ?? []).concat([curr]))
    },
    new Map<K, T[]>()
  )
}

function* findPairs<T>(arr: T[]) {
  for (let ii = 0; ii < arr.length; ii++) 
    for (let jj = ii + 1; jj < arr.length; jj++) 
      yield [arr[ii], arr[jj]] as const
}

function* findAntinodes(a: Position, b: Position) {
  const dRow = b.row - a.row
  const dCol = b.col - a.col
  // Can't be bothered generating antinodes precisely to the edge of the map,
  // so I just generate approximately to cover the map in excess, and filter
  // them later with a bounds check.
  for (
    let harmonic = 1;
    harmonic * Math.abs(dRow) <= gridMaxRow || harmonic * Math.abs(dCol) <= gridMaxCol;
    harmonic++
  ) {
    yield [
      { row: a.row - dRow*harmonic, col: a.col - dCol*harmonic },
      { row: b.row + dRow*harmonic, col: b.col + dCol*harmonic }
    ] as [Position, Position]
  }
}

function inBounds({ row, col }: Position) {
  return 0 <= row && row <= gridMaxRow && 0 <= col && col <= gridMaxCol
}

const groupsByFreq = groupBy(antennae, a => a.freq)
const pairs = [...groupsByFreq.values()].flatMap(group => [...findPairs(group)])

console.log(
  "Part 1:",
  groupBy(
    pairs
      .flatMap(pair => findAntinodes(pair[0], pair[1]).next().value!) // just the antinodes in the first harmonic
      .filter(inBounds),
    a => `${a.row},${a.col}`
  ).size
)

console.log(
  "Part 2:",
  groupBy(
    pairs
      .flatMap(pair => [...findAntinodes(pair[0], pair[1])].flat().concat(pair)) // all antinodes including antannae pairs
      .filter(inBounds),
    a => `${a.row},${a.col}`
  ).size
)
