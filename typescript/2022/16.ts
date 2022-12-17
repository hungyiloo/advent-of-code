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

const insertByMinCost = (ps: Node[], p: Node, costs: Map<string, number>) => {
  const queue = ps.filter((x) => x !== p);
  const pos = ps.findIndex((x) => costs.get(x.id)! > costs.get(p.id)!);
  queue.splice(pos === -1 ? queue.length : pos, 0, p);
  return queue;
};

const dijkstraMap = new Map<string, number>();
const dijkstra = (start: Node, end: Node) => {
  const key = `${start.id},${end.id}`;
  if (dijkstraMap.get(key)) return dijkstraMap.get(key)!;

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

  const result = costs.get(p.id)!;
  dijkstraMap.set(key, result);
  return result;
};

type State = {
  me: string;
  time: number;
  opened: string[];
  released: number;
};

function explore(
  initState: State,
) {
  const queue: State[] = [initState];
  const visited = new Set<string>([JSON.stringify(initState)]);
  let result = -Infinity;
  while (queue.length > 0) {
    const s = queue.pop()!;
    const currentNode = NODE_MAP.get(s.me)!;
    for (const nextNode of NODES_WITH_FLOW) {
      const distance = dijkstra(currentNode, nextNode) + 1;

      if (
        nextNode === currentNode || s.opened.includes(nextNode.id) ||
        distance > s.time
      ) {
        const released = s.released +
          s.opened.reduce((s, x) => s + NODE_MAP.get(x)!.flow, 0) * s.time;
        result = Math.max(result, released);
        continue;
      }

      const nextState: State = {
        me: nextNode.id,
        time: s.time - distance,
        released: s.released +
          s.opened.reduce((s, x) => s + NODE_MAP.get(x)!.flow, 0) * distance,
        opened: [...s.opened, nextNode.id],
      };

      if (!visited.has(JSON.stringify(nextState))) {
        queue.push(nextState);
        visited.add(JSON.stringify(nextState));
      }
    }
  }
  return result;
}

const part1 = explore({
  me: "AA",
  time: 30,
  opened: [],
  released: 0,
});

console.log(part1);
