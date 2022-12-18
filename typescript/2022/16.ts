const puzzleInput = (await Deno.readTextFile("../../input/2022/16.txt")).trim();

type Node = {
  id: string;
  flow: number;
  neighbors: string[];
};

const NODES = puzzleInput
  .split("\n")
  .map((line) =>
    line.split(/Valve | has flow rate=|; tunnels? leads? to valves? /)
  )
  .map(([, id, flow, neighbors]) => ({
    id,
    flow: Number(flow),
    neighbors: neighbors.split(", "),
  } as Node))
  .sort((a, b) => b.flow - a.flow);

const NODES_WITH_FLOW = NODES.filter((n) => n.flow > 0);
const NODE_MAP = new Map(NODES.map((n) => [n.id, n]));

// A priority queue mechanism for dijkstra search
const insertByMinCost = (ps: Node[], p: Node, costs: Map<string, number>) => {
  const queue = ps.filter((x) => x !== p);
  const pos = ps.findIndex((x) => costs.get(x.id)! > costs.get(p.id)!);
  queue.splice(pos === -1 ? queue.length : pos, 0, p);
  return queue;
};

// The shortest path map provides memoization of the dijkstra
// shortest path search, so that we can call it repeatedly
// on the same start/end inputs but not have to incur the
// cost of actually searching them again.
const shortestPathMap = new Map<string, number>();
const dijkstra = (start: Node, end: Node) => {
  const key = `${start.id},${end.id}`;
  if (shortestPathMap.has(key)) return shortestPathMap.get(key)!;

  const costs = new Map<string, number>();
  costs.set(start.id, 0);
  let queue = [start];
  let p: Node;
  const visited = new Set<string>();
  do {
    p = queue.shift()!;
    for (const neighborId of p.neighbors) {
      if (visited.has(neighborId)) continue;
      const neighbor = NODE_MAP.get(neighborId)!;
      costs.set(neighbor.id, costs.get(p.id)! + 1);
      queue = insertByMinCost(queue, neighbor, costs);
    }
    visited.add(p.id);
  } while (p !== end);

  for (const [endId, cost] of costs.entries()) {
    shortestPathMap.set(`${start.id},${endId}`, cost);
  }
  return costs.get(p.id)!;
};

type State = {
  at: string;
  time: number;
  opened: string[];
  released: number;
};

function explore(time: number) {
  const initState = {
    at: "AA",
    time,
    opened: [],
    released: 0,
  };
  const queue: State[] = [initState];
  const bestStates = new Map<string, State>();
  while (queue.length > 0) {
    const s = queue.pop()!;
    const release = s.opened.reduce((s, x) => s + NODE_MAP.get(x)!.flow, 0);

    // Save the best result for each unique combination of opened valves.
    // This comes in handy later for part 2, but also guarantees that we
    // can search through every possible best result for part 1.
    const key = [...s.opened].sort().join(",");
    const released = s.released + release * s.time;
    const previousResult = bestStates.get(key);
    if (!previousResult || previousResult.released < released) {
      bestStates.set(key, { ...s, released });
    }

    // Loop through each valid "next node" option and push
    // the next state onto the exploration queue
    const currentNode = NODE_MAP.get(s.at)!;
    const candidates = NODES_WITH_FLOW.filter((n) =>
      n !== currentNode && !s.opened.includes(n.id)
    );
    for (const n of candidates) {
      const distance = dijkstra(currentNode, n) + 1;
      if (distance > s.time) continue;
      queue.push({
        at: n.id,
        time: s.time - distance,
        released: s.released + release * distance,
        opened: [...s.opened, n.id],
      });
    }
  }
  return [...bestStates.values()];
}

const part1 = Math.max(...explore(30).map((s) => s.released));

const part2States = explore(26);
let part2 = 0;
for (const human of part2States) {
  const { opened: opened1, released: released1 } = human;
  for (const elephant of part2States) {
    const { opened: opened2, released: released2 } = elephant;
    if (!opened1.some((o) => opened2.includes(o))) {
      part2 = Math.max(released1 + released2, part2);
    }
  }
}

console.log("Part 1:", part1);
console.log("Part 2:", part2);
