import { from, map, reduce, reverse, sort, split } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import {
  filter$,
  getLines,
  map$,
  sum$,
  then,
  toArray$,
} from "../lib/streams.ts";

const pairs = new Map([
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
  ["<", ">"],
]);
const reversePairs = new Map(from(pairs.entries()).map(([a, b]) => [b, a]));
const syntaxScores = new Map<string | null, number>([
  [")", 3],
  ["]", 57],
  ["}", 1197],
  [">", 25137],
]);
const autocompleteScores = new Map<string | null, number>([
  [")", 1],
  ["]", 2],
  ["}", 3],
  [">", 4],
]);

interface ParseState {
  stack: string[];
  valid: boolean;
  lastChar: null | string;
}

const parseCode = (code: string) =>
  pipe(
    code,
    split(""),
    reduce(
      (acc, char: string) => {
        if (!acc.valid) return acc;
        const stack = acc.stack;
        if (from(reversePairs.values()).includes(char)) {
          stack.push(char);
        } else {
          if (reversePairs.get(char) !== stack.pop()) {
            acc.valid = false;
          }
        }
        return {
          ...acc,
          lastChar: char,
        };
      },
      { stack: [], valid: true, lastChar: null } as ParseState,
    ),
  );

const scoreAutocomplete = (state: ParseState) =>
  pipe(
    state.stack.slice(),
    reverse,
    map((c) => pairs.get(c) ?? ""),
    map((c) => autocompleteScores.get(c) ?? 0),
    reduce((score, c) => score * 5 + c, 0),
  );

const part1 = await pipe(
  getLines("10.input.txt"),
  map$(parseCode),
  map$((s) => s.valid ? 0 : syntaxScores.get(s.lastChar) ?? 0),
  sum$,
);
console.log("Part 1:", part1);

const part2 = await pipe(
  getLines("10.input.txt"),
  map$(parseCode),
  filter$((s) => s.valid),
  map$(scoreAutocomplete),
  toArray$,
  then((scores) =>
    pipe(
      scores,
      sort((a, b) => a - b),
      (sortedScores) => sortedScores[Math.floor(scores.length / 2)],
    )
  ),
);
console.log("Part 2", part2);
