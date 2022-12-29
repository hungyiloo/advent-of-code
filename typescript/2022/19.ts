const puzzleInput = (await Deno.readTextFile("../../input/2022/19.txt")).trim();

enum Resource {
  Ore = "ore",
  Clay = "clay",
  Obsidian = "obsidian",
  Geode = "geode",
}

type Blueprint = {
  id: string;
  robots: {
    robotType: Resource;
    costs: {
      resource: Resource;
      cost: number;
    }[];
  }[];
};

const BLUEPRINTS: Blueprint[] = puzzleInput.split("\n\n").map((blueprint) => {
  const [heading, ...rest] = blueprint.split("\n");
  const [, id] = heading.split(/Blueprint |:/);
  const robots = rest.map((line) => {
    const [, robotType, costsSpec] = line.split(/Each | robot costs /);
    const costs = costsSpec.replace(/\.$/, "").split(" and ").map(
      (costSpec) => {
        const [cost, resource] = costSpec.split(" ");
        return { cost: Number(cost), resource: resource as Resource };
      },
    );
    return { robotType: robotType as Resource, costs };
  });
  return { id, robots };
});

type State = {
  resources: Record<Resource, number>;
  robots: Record<Resource, number>;
  time: number;
};

function simulate(blueprint: Blueprint, timeLimit: number) {
  const queue: State[] = [{
    resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
    robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
    time: 1,
  }];
  const seen = new Map<string, number>();

  let max = 0;
  // let idx = 0;
  while (queue.length > 0) {
    // idx++;
    // if (idx % 10000 === 0) console.log(queue.length);
    const s = queue.pop()!;
    const key = JSON.stringify(s.resources) + JSON.stringify(s.robots);
    if (seen.get(key) ?? 0 > s.time) continue;
    seen.set(key, s.time);
    const robots = { ...s.robots };
    const resources = { ...s.resources };

    if (s.time > timeLimit) {
      if (resources.geode > max) {
        max = resources.geode;
      }
      continue;
    }

    const time = s.time + 1;
    const canBuy = blueprint.robots.filter((r) => {
      const totalCost = r.costs.reduce(
        (totalCost, c) => { totalCost[c.resource] += c.cost; return totalCost },
        { ore: 0, clay: 0, obsidian: 0 } as Record<Resource, number>
      )
      return resources.ore >= totalCost.ore && resources.clay >= totalCost.clay && resources.obsidian >= totalCost.obsidian;
    });

    Object.keys(s.robots).forEach((key) => {
      const r = key as Resource;
      resources[r] += s.robots[r];
    });


    for (const robot of canBuy) {
      const next = {
        resources: { ...resources },
        robots: { ...robots },
        time,
      };
      robot.costs.forEach((c) => next.resources[c.resource] -= c.cost);
      next.robots[robot.robotType]++;
      // console.log(next);
      queue.push(next);
    }
    queue.push({
      resources,
      robots,
      time,
    });
  }

  console.log(max);
  return max * Number(blueprint.id);
}

const part1 = BLUEPRINTS.map(b => simulate(b, 24)).reduce((s, x) => s + x);
console.log(part1);
