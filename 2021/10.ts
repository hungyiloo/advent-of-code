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

// Types
type OpeningToken = "(" | "[" | "{" | "<";
type ClosingToken = ")" | "]" | "}" | ">";
type Token = OpeningToken | ClosingToken;
interface ParseState {
  stack: Token[];
  valid: boolean;
  lastChar: null | Token;
}

// Type guard
const isOpeningToken = (x: Token): x is OpeningToken => x in pairs;

// Lookups
const pairs: Record<OpeningToken, ClosingToken> = {
  "(": ")",
  "[": "]",
  "{": "}",
  "<": ">",
};
const reversePairs = Object.entries(pairs).reduce(
  (acc, [k, v]) => ({ ...acc, [v]: k }),
  {} as Record<ClosingToken, OpeningToken>,
);
const syntaxScores: Record<ClosingToken, number> = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137,
};
const autocompleteScores: Record<ClosingToken, number> = {
  ")": 1,
  "]": 2,
  "}": 3,
  ">": 4,
};

// Functions
const parseCode = (code: string) =>
  pipe(
    code,
    split(""),
    (s) => s as Token[],
    reduce(
      (acc, char) => {
        if (!acc.valid) return acc;

        if (isOpeningToken(char)) {
          acc.stack.push(char);
        } else if (reversePairs[char] !== acc.stack.pop()) {
          acc.valid = false;
        }
        acc.lastChar = char;

        return acc;
      },
      { stack: [], valid: true, lastChar: null } as ParseState,
    ),
  );

const scoreAutocomplete = (state: ParseState) =>
  pipe(
    state.stack,
    reverse,
    map((c) => isOpeningToken(c) ? pairs[c] : undefined),
    map((c) => c ? autocompleteScores[c] : 0),
    reduce((score, c) => (score * 5) + c, 0),
  );

// Final answers
const part1 = await pipe(
  getLines("10.input.txt"),
  map$(parseCode),
  map$((s) =>
    !s.valid && s.lastChar && !isOpeningToken(s.lastChar)
      ? syntaxScores[s.lastChar]
      : 0
  ),
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
console.log("Part 2:", part2);
