const puzzleInput = (await Deno.readTextFile("../../input/2022/12.txt")).trim();

type Point = {
  x: number;
  y: number;
  letter: string;
  height: string;
  cost: number;
  visited: boolean;
};

const makeHeightmap = () =>
  puzzleInput
    .split('\n')
    .map((line, x) => line
    .split('')
    .map((letter, y) => ({
      x, y, letter,
      height: letter === 'S' ? 'a'
        : letter === 'E' ? 'z'
        : letter,
      cost: letter === 'E' ? 0 : Infinity,
      visited: false
    } as Point)));

const compareHeight = (p: Point, q: Point) =>
  q.height.charCodeAt(0) - p.height.charCodeAt(0);

const getNeighbors = (p: Point, heightmap: Point[][]) =>
  [
    heightmap[p.x - 1]?.[p.y],
    heightmap[p.x + 1]?.[p.y],
    heightmap[p.x]?.[p.y - 1],
    heightmap[p.x]?.[p.y + 1]
  ].filter(q => !!q && !q.visited && compareHeight(q, p) <= 1);

const insertByMinCost = (ps: Point[], p: Point) => {
  const queue = ps.filter(x => x !== p);
  const pos = ps.findIndex(x => x.cost > p.cost);
  queue.splice(pos === -1 ? queue.length : pos, 0, p);
  return queue;
}

const dijkstra = (goal: (p: Point) => boolean) => {
  const heightmap = makeHeightmap();
  let queue = heightmap.flatMap(x => x).filter(p => p.letter === 'E');
  let p: Point;
  do {
    p = queue.shift()!;
    for (const neighbor of getNeighbors(p, heightmap)) {
      neighbor.cost = p.cost + 1;
      queue = insertByMinCost(queue, neighbor);
    }
    p.visited = true;
  } while (queue.length > 0 && !goal(p))

  return p?.cost;
}

const part1 = dijkstra(p => p.letter === 'S');
const part2 = dijkstra(p => p.height === 'a');

console.log("Part 1:", part1);
console.log("Part 2:", part2);
