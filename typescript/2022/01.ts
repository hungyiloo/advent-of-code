const puzzleInput = (await Deno.readTextFile("../../input/2022/01.txt")).trim();

const elves: number[] = puzzleInput
  .split(/\r?\n/)
  .reduce(
    (acc: number[], curr: string) => {
      if (curr === '') {
        // blank line means new group;
        // so start a new total
        acc.push(0);
      } else {
        // add to the previous group
        const prev = acc.length - 1;
        acc[prev] += parseInt(curr);
      }
      return acc;
    },
    [0] // begin with one group
  );

const part1 = Math.max(...elves);

const part2 = elves
  .sort((a, b) => a - b)
  .slice(-3)
  .reduce((sum, x) => sum + x, 0);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
