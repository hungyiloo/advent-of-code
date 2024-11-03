const puzzleInput = (await Deno.readTextFile("../../input/2022/17.txt")).trim();

const Move = {
  L: { dx: -1, dy: 0 } as Movement,
  R: { dx: 1, dy: 0 } as Movement,
  D: { dx: 0, dy: -1 } as Movement,
};
type Point = { x: number; y: number };
type Movement = { dx: number; dy: number };
type Sprite = readonly boolean[][];

type Rock = {
  sprite: Sprite;
  height: number;
  width: number;
  position?: Point;
};

type Cave = Map<
  number,
  [boolean, boolean, boolean, boolean, boolean, boolean, boolean]
>;

const JETS = puzzleInput
  .split("")
  .map((c) => c === "<" ? Move.L : Move.R);

const PROTO_ROCKS = `
####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##`
  .trim()
  .split("\n\n")
  .map((grid) =>
    grid.split(/\r?\n/).reverse().map((row) =>
      row.trim().split("").map((c) => c === "#")
    )
  )
  .map((sprite) => ({
    sprite,
    height: sprite.length,
    width: sprite[0].length,
    settled: false,
  } as Rock));

function* getJets() {
  for (let ii = 0;; ii++) {
    yield JETS[ii % JETS.length];
  }
}

function* getRocks() {
  for (let ii = 0;; ii++) {
    yield PROTO_ROCKS[ii % PROTO_ROCKS.length];
  }
}

function spriteMap<T>(
  rock: Rock,
  fn: (x: number, y: number, row: number, col: number) => T,
) {
  if (!rock.position) {
    throw new Error(`Can't manipulate a rock with undefined position`);
  }
  const result: T[] = [];
  for (let row = 0; row < rock.height; row++) {
    for (let col = 0; col < rock.width; col++) {
      const cell = rock.sprite[row][col];
      if (!cell) continue;
      const { x, y } = rock.position!;
      const cellX = x + col;
      const cellY = y + row;
      result.push(fn(cellX, cellY, row, col));
    }
  }
  return result;
}

function getCell(cave: Cave, x: number, y: number) {
  return cave.get(y)?.[x] ?? false;
}

function setCell(cave: Cave, x: number, y: number, value = true) {
  const row = cave.get(y) ?? [false, false, false, false, false, false, false];
  row[x] = value;
  cave.set(y, row);
}

function settle(rock: Rock, cave: Cave) {
  spriteMap(rock, (x, y) => {
    if (getCell(cave, x, y)) {
      throw new Error(`Settling in a position already occupied: ${x}, ${y}`);
    }
    setCell(cave, x, y);
  });
}

function tryMove(rock: Rock, cave: Cave, move: Movement) {
  if (!rock.position) {
    throw new Error(`Can't move a rock with undefined position`);
  }
  rock.position.x += move.dx;
  rock.position.y += move.dy;
  const collision = spriteMap(
    rock,
    (x, y) => !!getCell(cave, x, y) || x < 0 || x >= 7 || y < 0,
  ).some((x) => x);
  if (collision) {
    rock.position.x -= move.dx;
    rock.position.y -= move.dy;
    return false;
  }
  return true;
}

function hashState(cave: Cave, height: number) {
  const LOOKBACK = 100;
  return Array(LOOKBACK).fill(height).map((y, i) => {
    const row = cave.get(y - i) ??
      [false, false, false, false, false, false, false];
    return row.reduce((acc, c) => (acc << 1) | (c ? 1 : 0), 0);
  }).join("|");
}

function simulate(rockLimit: number) {
  const SPAWN_AT_X = 2;
  const cave: Cave = new Map();
  const jets = getJets();
  const rocks = getRocks();
  const statesSeen = new Map<string, [number, number]>();
  let height = -1;
  let virtualHeight = 0;
  let virtualRocks = 0;
  for (let rockCount = 0; rockCount < rockLimit - virtualRocks; rockCount++) {
    const rock: Rock = {
      ...rocks.next().value!,
      position: { x: SPAWN_AT_X, y: height + 4 },
    };

    for (let step = 0;; step++) {
      if (step % 2 === 0) {
        const jet = jets.next().value!;
        tryMove(rock, cave, jet);
      } else if (!tryMove(rock, cave, Move.D)) {
        settle(rock, cave);
        height = Math.max(height, ...spriteMap(rock, (_x, y) => y));

        // cycle detection and compensation
        if (virtualRocks === 0) {
          const hash = hashState(cave, height);
          const state = statesSeen.get(hash);
          if (state) {
            const [prevRocks, prevHeight] = state;
            const cycles = Math.floor(
              (rockLimit - rockCount) / (rockCount - prevRocks),
            );
            virtualRocks = cycles * (rockCount - prevRocks);
            virtualHeight = cycles * (height - prevHeight);
          } else {
            statesSeen.set(hash, [rockCount, height]);
          }
        }

        break;
      }
    }
  }

  return height + virtualHeight + 1;
}

const part1 = simulate(2022);
const part2 = simulate(1_000_000_000_000);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
