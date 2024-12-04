import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/01.txt")).trim()

const parse = sss.array(/\r?\n/, sss.array(/ {3}/, Number));
const data = parse(puzzleInput);
const left = data.map((x) => x[0]).sort((a, b) => a - b);
const right = data.map((x) => x[1]).sort((a, b) => a - b);

const pairs = left.map((l, ii) => [l, right[ii]]);
console.log(
  "Part 1:",
  pairs.reduce((sum, [l, r]) => sum + Math.abs(l - r), 0),
);

const counts = left.reduce(
  (counts, x) => {
    counts[x] = (counts[x] ?? 0) + 1;
    return counts;
  },
  {} as Record<number, number>,
);
console.log(
  "Part 2:",
  left.reduce((score, l) => score + l * (counts[l] ?? 0), 0),
);
