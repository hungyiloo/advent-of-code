import { range } from "../lib/array.ts";
import { getLines, toArray } from "../lib/streams.ts";

const data = await toArray(getLines("03.input.txt"));
const bits = data[0]?.length ?? 0;

const majority = (numbers: string[]) =>
  numbers
    .reduce(
      // add or subtract 1 from score if bit is 1 or 0 respectively
      (acc, curr) => acc.map((s, i) => s + (curr[i] === "1" ? 1 : -1)),
      range(bits).map(() => 0),
    )
    // a positive or zero score means 1 was more frequent; zero otherwise
    .map((s) => s >= 0 ? "1" : "0")
    .join("");

const minority = (numbers: string[]) =>
  majority(numbers).split("").map((c) => c === "0" ? "1" : "0").join("");

const gamma = parseInt(majority(data), 2);
const epsilon = parseInt(minority(data), 2);
console.log("Part 1:", gamma * epsilon);

function search(combinator: (numbers: string[]) => string) {
  const match = range(bits).reduce(
    (remaining, i) => {
      if (remaining.length <= 1) return remaining;
      const pattern = combinator(remaining);
      return remaining.filter((num) => num[i] === pattern[i]);
    },
    data,
  )[0];

  return parseInt(match, 2);
}

const o2GeneratorRating = search(majority);
const co2ScrubberRating = search(minority);
console.log("Part 2:", o2GeneratorRating * co2ScrubberRating);
