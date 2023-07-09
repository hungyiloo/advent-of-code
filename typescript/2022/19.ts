const puzzleInput = (await Deno.readTextFile("../../input/2022/19.txt")).trim();

enum Resource { Ore = "ore", Clay = "clay", Obsidian = "obsidian", Geode = "geode", }

type ResourceRecord<T> = Record<Resource, T>

type Blueprint = {
  id: string;
  robots: ResourceRecord<ResourceRecord<number>>;
  maxCosts: ResourceRecord<number>;
};

type SearchState = {
  resources: Record<Resource, number>;
  robots: Record<Resource, number>;
  time: number;
};

function resourceEntries<T>(r: ResourceRecord<T>) {
  return Object.entries(r).map(([resource, item]) => [resource as Resource, item] as const)
}

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
    return [robotType, costs] as const;
  }).reduce((acc, [resource, costs]) => ({ ...acc, [resource]: costs }), {} as Blueprint['robots']);
  return {
    id,
    robots,
    maxCosts: resourceEntries(robots).reduce((acc, [_robotType, costs]) => ({
      ...acc,
      ore: Math.max(acc.ore ?? 0, costs.ore ?? 0),
      clay: Math.max(acc.clay ?? 0, costs.clay ?? 0),
      obsidian: Math.max(acc.obsidian ?? 0, costs.obsidian ?? 0),
      geode: Infinity,
    }), {} as Record<Resource, number>)
  };
});

function search(blueprint: Blueprint, timeLimit: number) {
  const queue: SearchState[] = [{
    resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
    robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
    time: 0,
  }];

  const seenStates = new Map<string, number>();

  function score(s: SearchState) {
    const timeLeft = timeLimit - s.time
    const currentGeodes = s.resources.geode
    const guaranteedGeodes = s.robots.geode * timeLeft
    const potentialGeodes = timeLeft*(timeLeft - 1) / 2

    return currentGeodes + guaranteedGeodes + potentialGeodes
  }

  function shouldExplore(s: SearchState) {
    const key = `${s.resources.ore}|${s.resources.clay}|${s.resources.obsidian}|${s.resources.geode}||${s.robots.ore}|${s.robots.clay}|${s.robots.obsidian}|${s.robots.geode}`;
    if ((seenStates.get(key) ?? Infinity) <= s.time) return false;
    seenStates.set(key, s.time);

    if (!bestState) return true
    return score(s) > bestScore
  }

  let bestState: SearchState | null = null;
  let bestScore = -Infinity;
  while (queue.length > 0) {
    const s = queue.pop()!;
    if (!shouldExplore(s)) continue;

    // If time is up on this state, update the best state according to
    // geodes (if it's better) then end processing for this state.
    if (s.time >= timeLimit) {
      if (!bestState || s.resources.geode > bestState.resources.geode) {
        bestState = {...s};
        bestScore = score(bestState)
      }
      continue;
    }

    // Figure out which robots we should build this minute
    const shouldBuild = resourceEntries(blueprint.robots).filter(([robotType, robotCost]) => {
      const canAfford = s.resources.ore >= (robotCost.ore ?? 0) && s.resources.clay >= (robotCost.clay ?? 0) && s.resources.obsidian >= (robotCost.obsidian ?? 0);

      const maxedProduction = s.robots[robotType] >= blueprint.maxCosts[robotType]
      // if (maxedProduction) {
      //   console.log(`Give up building ${robotType} robot
      //                because we already have ${robots[robotType]}
      //                and the maximum ${robotType} we can spend per min
      //                is ${blueprint.maxCosts[robotType]}`)
      // }

      return canAfford && !maxedProduction
    });

    // Advance the time by 1 minute
    const time = s.time + 1;

    // Acquire resources from existing robots for this minute
    resourceEntries(s.robots).forEach(([r]) => {
      s.resources[r] += s.robots[r]

      // If we have more resources than we can possibly spend in the
      // remaining time, cap it at that limit to reduce the search space
      const spendLimit = blueprint.maxCosts[r] * (timeLimit - time)
      if (s.resources[r] >= spendLimit) {
        s.resources[r] = spendLimit
      }
    });

    // Explore states where we build a robot
    for (const robot of shouldBuild) {
      const next = { resources: { ...s.resources }, robots: { ...s.robots }, time };
      const [robotType, robotCost] = robot
      next.resources.ore -= robotCost.ore ?? 0
      next.resources.clay -= robotCost.clay ?? 0
      next.resources.obsidian -= robotCost.obsidian ?? 0
      next.robots[robotType]++;
      queue.push(next)
    }

    // But also remember to explore states where we build
    // nothing and just let the minute pass
    queue.push({ ...s, time })
  }

  // console.log(blueprint.id, bestState);

  return { blueprint, geodes: bestState?.resources.geode ?? 0 };
}

const part1 = BLUEPRINTS.map(b => search(b, 24)).reduce((s, { blueprint, geodes }) => s + (Number(blueprint.id) * geodes), 0);
console.log("Part 1:", part1);

const part2 = BLUEPRINTS.slice(0,3).map(b => search(b, 32)).reduce((m, { geodes }) => m * geodes, 1);
console.log("Part 2:", part2);
