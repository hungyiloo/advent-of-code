const puzzleInput = (await Deno.readTextFile("../../input/2022/14.txt")).trim();

type Cell = "#" | "o";
type Coord = [number, number];
type Wall = Coord[];
type Cave = Map<string, Cell>;

const WALLS: Wall[] = puzzleInput
  .split("\n")
  .map(
    (line) =>
      line
        .split(" -> ")
        .map((coord) => coord.split(","))
        .map(([x, y]) => [Number(x), Number(y)]),
  );

const WALL_MAX_DEPTH = Math.max(
  ...WALLS.flatMap((w) => w).map(([, y]) => y),
);

// Expands a wall definition into a full list of coordinates
const expand = (wall: Wall) => {
  return wall.slice(1).reduce(
    (coords, [x2, y2], ii) => {
      const [x1, y1] = wall[ii];
      return coords.concat(
        x1 === x2
          ? Array(Math.abs(y1 - y2) + 1)
            .fill(Math.min(y1, y2))
            .map((y, i) => [x1, y + i])
          : Array(Math.abs(x1 - x2) + 1)
            .fill(Math.min(x1, x2))
            .map((x, i) => [x + i, y1]),
      );
    },
    [] as Coord[],
  );
};

// Encodes an [x,y] coordinate to a string for use in hash map
const encodeCoord = (x: number, y: number) => `${x},${y}`;

// Get the cell contents of a cave at [x,y]
const check = (cave: Cave, x: number, y: number, floor?: number) =>
  y === floor ? "#" : cave.get(encodeCoord(x, y));

// Settle a grain of sand at [x,y]
const settle = (cave: Cave, x: number, y: number) =>
  cave.set(encodeCoord(x, y), "o");

// Simulate falling sand with or without a floor
function simulate(hasFloor: boolean) {
  const floor = hasFloor ? WALL_MAX_DEPTH + 2 : undefined;
  const abyss = floor ?? WALL_MAX_DEPTH;

  const cave: Cave = new Map<string, Cell>(
    WALLS
      .flatMap(expand)
      .map(([x, y]) => [encodeCoord(x, y), "#"]),
  );

  let sand = 0;
  while (true) {
    let [x, y] = [500, 0];
    while (y < abyss) {
      if (!check(cave, x, y + 1, floor)) {
        y++; // fall down
      } else if (!check(cave, x - 1, y + 1, floor)) {
        y++;
        x--; // fall left
      } else if (!check(cave, x + 1, y + 1, floor)) {
        y++;
        x++; // fall right
      } else {
        settle(cave, x, y);
        break;
      }
    }

    // stop counting if sand starts leaking
    if (y >= abyss) break;
    sand++;

    // stop if last grain of sand blocks source
    if (x === 500 && y === 0) break;
  }

  return sand;
}

const part1 = simulate(false);
const part2 = simulate(true);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
