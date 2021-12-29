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

// The puzzle input is in the format:
//
// |--------------------- INPUT PATTERN ---------------------| |----- OUTPUT -----|
// bgcfda gecbda abdgf aedfbg eda efcbd ae agfe bdefagc fbeda | ae egdafb ea fcdeb
//                                  |                                |
// WORDS made of letter SEGMENTS ---+--------------------------------+

const part1 = await pipe(
  getLines("../../input/2021/08.txt"),
  map$((l) => l.split(" | ")[1]),
  map$((output) =>
    pipe(
      output.trim(),
      split(" "),
      map((word) => word.length),
      // part 1 doesn't require decoding anything;
      // we just count the number of OUTPUT WORDS that match these lengths
      count((wordLength) => [2, 4, 3, 7].includes(wordLength)),
    )
  ),
  sum$,
);
console.log("Part 1:", part1);

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
//
//                0      1  2     3     4    5     6      7   8       9
const baseline = "abcefg cf acdeg acdfg bcdf abdfg abdefg acf abcdefg abcdfg";

/**
 * Generates scores for each of the segments in a pattern.
 * It doesn't matter if the input pattern is encoded or baseline, because the
 * scores are invariant.
 */
const scorePatterns = (patterns: string) =>
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

/**
 * Gets the digit for a given baseline (i.e. decoded) word
 * e.g. cf => 1
 * e.g. acf => 7
 */
const findDigitByWord = pipe(
  baseline,
  split(" "),
  map((segments, digit) => [segments, digit] as const),
  (entries) => new Map(entries),
  (m) => (baselineWord: string) => m.get(baselineWord)!,
);

/**
 * Gets the baseline-equivalent (i.e. true) segment given a unique score
 */
const findTrueSegmentByScore = pipe(
  scorePatterns(baseline),
  (m) =>
    pipe(
      from(m.entries()),
      map(([k, v]) => [v, k] as const),
      (reversedEntries) => new Map(reversedEntries),
    ),
  (scoreMap) => (score: number) => scoreMap.get(score)!,
);

/**
 * Constructs a segment decoder from a given PATTERN, by using the baseline
 * data above. The resulting decoder takes an ENCODED SEGMENT and returns the
 * TRUE SEGMENT.
 */
const segmentDecoder = (patterns: string) =>
  pipe(
    scorePatterns(patterns),
    (scoreMap) =>
      pipe(
        from(scoreMap.entries()),
        map(([segment, score]) =>
          [segment, findTrueSegmentByScore(score)] as const
        ),
        (entries) => new Map(entries),
      ),
    (decodeMap) => (encodedSegment: string) => decodeMap.get(encodedSegment)!,
  );

/**
 * Decodes output words to a single number, given a segmentDecoder.
 * Output words are in the format: "ae egdafb ea fcdeb", where each word
 * corresponds to a digit, but it is encoded (see segmentDecoder)
 */
const decodeOutput = (
  words: string,
  decodeSegment: ReturnType<typeof segmentDecoder>,
) =>
  pipe(
    words,
    split(" "),
    map((word) =>
      pipe(
        word,
        split(""),
        map(decodeSegment),
        sort(), // lexicographically
        join(""),
      )
    ),
    map(findDigitByWord),
    join(""),
    Number,
  );

const part2 = await pipe(
  getLines("../../input/2021/08.txt"),
  map$((line) =>
    pipe(
      line,
      split(" | "),
      ([patterns, output]) => decodeOutput(output, segmentDecoder(patterns)),
    )
  ),
  sum$,
);

console.log("Part 2:", part2);
