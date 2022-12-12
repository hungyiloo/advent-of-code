const puzzleInput = (await Deno.readTextFile("../../input/2022/03.txt")).trim();

const rucksacks: string[] = puzzleInput.split('\n');

function intersection(...xs: string[]): string[] {
  // Create sets of characters for each string.
  // Note: dedupes all characters within each string.
  const sets = xs
    .map(x => new Set<string>(x.split('')));

  // Then reduce over the sets, using filter()
  // to accumulate the overlapping values
  return sets.slice(1).reduce(
    (overlap, set) => overlap.filter(x => set.has(x)),
    Array.from(sets[0].values())
  );
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz';
const priorityMap = new Map([
  // lowercase letters 1 through 26
  ...alphabet
    .split('')
    .map((char, i) => [char, i+1] as const),
  // uppercase letters 27 through 52
  ...alphabet
    .toUpperCase()
    .split('')
    .map((char, i) => [char, i+27] as const)
]);

const part1 = rucksacks
  .flatMap(rucksack => {
    const middle = rucksack.length / 2;
    const left = rucksack.slice(0, middle);
    const right = rucksack.slice(middle);
    return intersection(left, right)
  })
  .map(mistake => priorityMap.get(mistake)!)
  .reduce((sum, p) => sum + p, 0);

const part2 = rucksacks
  // Group into bunches of 3 rucksacks by reducing,
  // creating a new group whenever index mod 3 is 0
  .reduce(
    (acc, curr, i) => {
      if (i % 3 === 0) { acc.push([]); }
      const prev = acc.length - 1;
      acc[prev].push(curr);
      return acc;
    },
    [] as string[][]
  )
  // Find the badge (i.e. intersection) of each triplet,
  // then look up the priorities and total them up
  .flatMap(triplet => intersection(...triplet))
  .map(badge => priorityMap.get(badge)!)
  .reduce((sum, p) => sum + p, 0);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
