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

console.log(
  "Part 2:",
  parseAllInstructions(puzzleInput).reduce(
    ({ enabled, answer }, curr) => {
      if (curr === "do()") {
        return { enabled: true, answer };
      } else if (curr === "don't()") {
        return { enabled: false, answer };
      } else if (enabled) {
        const [a, b] = parseFactors(curr);
        return { enabled, answer: answer + a * b };
      } else {
        return { enabled, answer };
      }
    },
    { enabled: true, answer: 0 },
  ).answer
);
