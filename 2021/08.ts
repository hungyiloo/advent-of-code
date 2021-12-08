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
//        Honestly this is all a mess. Maybe I'll clean it up later...       //
///////////////////////////////////////////////////////////////////////////////

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
                filter((s) => s.has(segment)),
                map((s) => Math.pow(s.size, 2)),
                sum,
              ),
            ),
          new Map<string, number>(),
        ),
      ),
  );

const baseline = "abcefg cf acdeg acdfg bcdf abdfg abdefg acf abcdefg abcdfg";

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
    (digits) =>
      digits.map((digit) =>
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
      ([patterns, output]) => {
        const decodeSegment = segmentDecoder(patterns);
        return pipe(
          outputDecoder(output, decodeSegment),
          join(""),
          (x) => parseInt(x, 10),
        );
      },
    )
  ),
  sum$,
);

console.log("Part 2:", part2);
