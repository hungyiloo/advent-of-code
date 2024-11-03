const puzzleInput = (await Deno.readTextFile("../../input/2022/18.txt")).trim();

type Point = { x: number; y: number; z: number };

const POINTS = puzzleInput.split(/\r?\n/).map((line) => {
  const [x, y, z] = line.split(",").map(Number);
  return { x, y, z } as Point;
});

function id({ x, y, z }: Point) {
  return `${x},${y},${z}`;
}

function getNeighbors({ x, y, z }: Point) {
  return [
    { x: x + 1, y, z },
    { x, y: y + 1, z },
    { x, y, z: z + 1 },
    { x: x - 1, y, z },
    { x, y: y - 1, z },
    { x, y, z: z - 1 },
  ] as Point[];
}

const POINT_SET = POINTS.reduce(
  (acc, curr) => acc.add(id(curr)),
  new Set<string>(),
);

const part1 = POINTS.flatMap(getNeighbors).reduce(
  (area, point) => area + (POINT_SET.has(id(point)) ? 0 : 1),
  0,
);

const BOUNDS = POINTS.reduce(
  (acc, { x, y, z }) => ({
    minX: Math.min(acc.minX, x),
    maxX: Math.max(acc.maxX, x),
    minY: Math.min(acc.minY, y),
    maxY: Math.max(acc.maxY, y),
    minZ: Math.min(acc.minZ, z),
    maxZ: Math.max(acc.maxZ, z),
  }),
  {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  },
);

const part2 = (() => {
  const visited = new Set<string>();
  const queue: Point[] = [{
    x: BOUNDS.minX - 1,
    y: BOUNDS.minY - 1,
    z: BOUNDS.minZ - 1,
  }];
  let area = 0;

  while (queue.length > 0) {
    const p = queue.pop()!;
    if (visited.has(id(p))) continue;
    visited.add(id(p));
    for (const neighbor of getNeighbors(p)) {
      if (visited.has(id(neighbor))) continue;
      const { x, y, z } = neighbor;
      if (x > BOUNDS.maxX + 1 || x < BOUNDS.minX - 1) continue;
      if (y > BOUNDS.maxY + 1 || y < BOUNDS.minY - 1) continue;
      if (z > BOUNDS.maxZ + 1 || z < BOUNDS.minZ - 1) continue;
      if (POINT_SET.has(id(neighbor))) {
        area++;
      } else {
        queue.push(neighbor);
      }
    }
  }

  return area;
})();

console.log("Part 1:", part1);
console.log("Part 2:", part2);
