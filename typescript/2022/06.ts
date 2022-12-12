const puzzleInput = (await Deno.readTextFile("../../input/2022/06.txt")).trim();

const search = (str: string, len: number) => {
  for (let ii = len; ii < str.length; ii++) {
    const substring = str.slice(ii - len, ii);
    if (new Set(substring).size === len) {
      return ii;
    }
  }
}

const part1 = search(puzzleInput, 4);
const part2 = search(puzzleInput, 14);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
