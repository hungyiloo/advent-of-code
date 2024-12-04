import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/03.txt")).trim();

const parseMuls = sss.array(/(mul\(\d+,\d+\))/).matches();
const parseFactors = sss.array(/[\(,\)]/, Number).slice(1, 3);

console.log(
  "Part 1:",
  parseMuls(puzzleInput)
    .map(parseFactors)
    .reduce((sum, [a, b]) => sum + a * b, 0),
);

const parseAllInstructions = sss
  .array(/(mul\(\d+,\d+\)|do(?:n't)?\(\))/)
  .matches();

const { part2 } = parseAllInstructions(puzzleInput).reduce(
  ({ enabled, part2 }, curr) => {
    if (curr === "do()") {
      return { enabled: true, part2 };
    } else if (curr === "don't()") {
      return { enabled: false, part2 };
    } else if (enabled) {
      const [a, b] = parseFactors(curr);
      return { enabled, part2: part2 + a * b };
    } else {
      return { enabled, part2 };
    }
  },
  { enabled: true, part2: 0 },
);

console.log("Part 2:", part2);
