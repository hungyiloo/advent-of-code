import {
  count,
  filter,
  from,
  join,
  map,
  reduce,
  sort,
  split,
  sum,
} from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, map$, sum$ } from "../lib/streams.ts";

const part1 = await pipe(
  getLines("08.input.txt"),
  map$((l) => l.split(" | ")[1]),
  map$((outputs) =>
    pipe(
      outputs.trim(),
      split(" "),
      map((digit) => digit.length),
      count((digitLength) => [2, 4, 3, 7].includes(digitLength)),
    )
  ),
  sum$,
);
console.log("Part 1:", part1);

///////////////////////////////////////////////////////////////////////////////
//    Honestly Part 2 is a complete mess. Maybe I'll clean it up later...    //
///////////////////////////////////////////////////////////////////////////////

//                0      1  2     3     4    5     6      7   8       9
const baseline = "abcefg cf acdeg acdfg bcdf abdfg abdefg acf abcdefg abcdfg";

// Using the baseline configuration (i.e. before the wires were messed up)
// we can calculate a unique score for each true segment a-to-g. These SCORES
// do not change when the wires get messed up, even though the LETTERS change.
// The invariant scores are calculated in code below, but they're actually
// constant, so I can list them out here:
//
// Map {
//   "a" => 241,
//   "b" => 198,
//   "c" => 200,
//   "d" => 212,
//   "e" => 146,
//   "f" => 236,
//   "g" => 232
// }
//
// (see the getScores function below for how they're calculated)
//
// The numbers on the right act like identifiers for the true segment. So when
// decoding the messed up displays, we just calculate the scores based on the 10
// unique patterns given by each input, get the scores, them map them back to
// the true segments. The rest is trivial.

const getScores = (patterns: string) =>
  pipe(
    patterns,
    split(" "),
    map((chars) => new Set(chars.split(""))),
    (sets) =>
      pipe(
        "abcdefg",
        split(""),
        reduce(
          (acc, segment) =>
            acc.set(
              segment,
              pipe(
                sets,
                // find all the patterns that have this segment
                filter((s) => s.has(segment)),
                // then square the sizes of each of those patterns
                map((s) => Math.pow(s.size, 2)),
                // and add them up to get the score
                sum,
              ),
            ),
          new Map<string, number>(),
        ),
      ),
  );

const trueSegmentsToDigit = pipe(
  baseline,
  split(" "),
  map((segments, digit) => [segments, digit] as const),
  (entries) => new Map(entries),
  (m) => (segments: string) => m.get(segments)!,
);

const scoreToTrueSegment = pipe(
  getScores(baseline),
  (m) =>
    pipe(
      from(m.entries()),
      map(([k, v]) => [v, k] as const),
      (reversedEntries) => new Map(reversedEntries),
    ),
);

const segmentDecoder = (patterns: string) =>
  pipe(
    getScores(patterns),
    (scoreMap) =>
      pipe(
        from(scoreMap.entries()),
        map(([segment, score]) =>
          [segment, scoreToTrueSegment.get(score)!] as const
        ),
        (entries) => new Map(entries),
      ),
    (trueSegments) => (segment: string) => trueSegments.get(segment)!,
  );

const outputDecoder = (
  output: string,
  decodeSegment: ReturnType<typeof segmentDecoder>,
) =>
  pipe(
    output,
    split(" "),
    map((digit) =>
      pipe(
        digit,
        split(""),
        map(decodeSegment),
        sort(), // lexicographically
        join(""),
      )
    ),
    map(trueSegmentsToDigit),
  );

const part2 = await pipe(
  getLines("08.input.txt"),
  map$((line) =>
    pipe(
      line,
      split(" | "),
      ([patterns, output]) =>
        pipe(
          outputDecoder(output, segmentDecoder(patterns)),
          join(""),
          (x) => parseInt(x, 10),
        ),
    )
  ),
  sum$,
);

console.log("Part 2:", part2);
