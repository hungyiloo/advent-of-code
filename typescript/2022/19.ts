const puzzleInput = (await Deno.readTextFile("../../input/2022/19.txt")).trim();

enum Resource {
  Ore = "ore",
  Clay = "clay",
  Obsidian = "obsidian",
  Geode = "geode",
}

type Blueprint = {
  id: string;
  robots: Record<Resource, Record<Resource, number>>;
};

const BLUEPRINTS: Blueprint[] = puzzleInput.split("\n").map((blueprint) => {
  const [heading, ...rest] = blueprint.split(/[:\.] /);
  const id = heading.replace(/Blueprint /, "");
  const robots = rest.map((line) => {
    const [, robotType, costsSpec] = line.split(/Each | robot costs /);
    const costs = costsSpec.split(" and ").map(
      (costSpec) => {
        const [cost, resource] = costSpec.split(" ");
        return [resource.replace(".", ""), Number(cost)];
      },
    ).reduce((acc, [resource, cost]) => ({ ...acc, [resource]: cost }), {} as Record<Resource, number>);
    return [robotType as Resource, costs] as const;
  }).reduce((acc, [resource, costs]) => ({ ...acc, [resource]: costs }), {} as Blueprint['robots']);
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
    time: 0,
  }];
  const seen = new Map<string, number>();

  function score(s: State) {
    const timeLeft = timeLimit - s.time
    const currentGeodes = s.resources.geode
    const guaranteedGeodes = s.robots.geode * timeLeft
    const potentialGeodes = timeLeft*(timeLeft - 1) / 2

    return (currentGeodes + guaranteedGeodes + potentialGeodes)// * 100 + (s.robots.ore + s.robots.clay + s.robots.obsidian + s.robots.geode) * 10 + (s.resources.ore + s.resources.clay + s.resources.obsidian)
  }

  function shouldExplore(s: State, see = false) {
    const key = `${s.resources.ore}|${s.resources.clay}|${s.resources.obsidian}|${s.resources.geode}||${s.robots.ore}|${s.robots.clay}|${s.robots.obsidian}|${s.robots.geode}`;
    if ((seen.get(key) ?? Infinity) <= s.time) return false;
    if (see) seen.set(key, s.time);

    if (!max) return true
    return score(s) > score(max)
  }

  function addToQueue(next: State) {
    if (!shouldExplore(next)) return;
    queue.push(next)
    // const nextScore = score(next)
    // const nextPlace = queue.findIndex(s => nextScore < score(s))
    // // console.log(queue.map(s => score(s)))
    // queue.splice(nextPlace === -1 ? queue.length : nextPlace, 0, next)
  }

  let max: State | null = null;
  // let idx = 0;
  while (queue.length > 0) {
    // idx++;
    // if (idx % 10000 === 0) console.log(queue.length);
    const s = queue.pop()!;
    if (!shouldExplore(s, true)) continue;
    const robots = { ...s.robots };
    const resources = { ...s.resources };

    if (s.time >= timeLimit) {
      if (!max || resources.geode > max.resources.geode) {
        max = {...s};
        // console.log(max)
      }
      continue;
    }

    const time = s.time + 1;
    const canBuy = Object.entries(blueprint.robots).filter(([_resource, costs]) => {
      return resources.ore >= (costs.ore ?? 0) && resources.clay >= (costs.clay ?? 0) && resources.obsidian >= (costs.obsidian ?? 0);
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
      const [robotType, robotCosts] = robot
      next.resources.ore -= robotCosts.ore ?? 0
      next.resources.clay -= robotCosts.clay ?? 0
      next.resources.obsidian -= robotCosts.obsidian ?? 0
      next.robots[robotType as Resource]++;
      addToQueue(next)
    }
    addToQueue({
      resources,
      robots,
      time,
    })
  }

  console.log(blueprint.id, max);
  return { blueprint, geodes: max?.resources.geode ?? 0 };
}

const part1 = BLUEPRINTS.map(b => simulate(b, 24)).reduce((s, { blueprint, geodes }) => s + (Number(blueprint.id) * geodes), 0);
console.log(part1);

const part2 = BLUEPRINTS.slice(0,3).map(b => simulate(b, 32)).reduce((m, { geodes }) => m * geodes, 1);
console.log(part2);
