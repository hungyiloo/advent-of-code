import { join, map, range, reduce, split } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, toArray$ } from "../lib/streams.ts";

const data = await toArray$(getLines("../../input/2021/03.txt"));
const bits = data[0]?.length ?? 0;

type Combinator = (numbers: string[]) => string;

const majority: Combinator = (numbers) =>
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
    join(""),
  );

// the minority is simply the opposite of the majority!
const minority: Combinator = (numbers) =>
  pipe(
    majority(numbers),
    split(""),
    map((c) => c === "0" ? "1" : "0"), // invert every bit
    join(""),
  );

const gamma = parseInt(majority(data), 2);
const epsilon = parseInt(minority(data), 2);
console.log("Part 1:", gamma * epsilon);

function search(data: string[], bit: number, combinator: Combinator): string[] {
  if (data.length <= 1 || bit === bits) return data;

  const sieve = combinator(data)[bit];
  return search(
    data.filter((num) => num[bit] === sieve),
    bit + 1,
    combinator,
  );
}

const startSearch = (combinator: Combinator) =>
  parseInt(search(data, 0, combinator)[0], 2);

const o2GeneratorRating = startSearch(majority);
const co2ScrubberRating = startSearch(minority);
console.log("Part 2:", o2GeneratorRating * co2ScrubberRating);
