import { join, map, range, reduce, split } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, toArray$ } from "../lib/streams.ts";

const data = await toArray$(getLines("03.input.txt"));
const bits = data[0]?.length ?? 0;

const majority = (numbers: string[]) =>
  pipe(
    numbers,
    reduce(
      // add or subtract 1 from score if bit is "1" or "0" respectively
      (acc, curr) => acc.map((s, i) => s + (curr[i] === "1" ? 1 : -1)),
      // scores start at zero for each position
      range(bits).fill(0),
    ),
    // zero or positive score means "1" was the majority;
    // negative score means "0" was the majority
    map((s) => s >= 0 ? "1" : "0"),
    join("")
  );

// the minority is simply the opposite of the majority!
const minority = (numbers: string[]) =>
  pipe(
    majority(numbers),
    split(""),
    map((c) => c === "0" ? "1" : "0"), // invert every bit
    join("")
  )

const gamma = parseInt(majority(data), 2);
const epsilon = parseInt(minority(data), 2);
console.log("Part 1:", gamma * epsilon);

function search(combinator: (numbers: string[]) => string) {
  let remaining = data;
  for (const i of range(bits)) {
    if (remaining.length <= 1) break;
    const pattern = combinator(remaining);
    remaining = remaining.filter((num) => num[i] === pattern[i]);
  }
  return parseInt(remaining[0], 2);
}

const o2GeneratorRating = search(majority);
const co2ScrubberRating = search(minority);
console.log("Part 2:", o2GeneratorRating * co2ScrubberRating);
