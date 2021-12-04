import { range } from "../lib/array.ts";
import { getLines, toArray } from "../lib/streams.ts";

const data = await toArray(getLines("03.input.txt"));
const bits = data[0]?.length ?? 0;

const majority = (numbers: string[], invert?: boolean) =>
  numbers
    .reduce(
      (acc, curr) => acc.map((s, i) => s + (curr[i] === "1" ? 1 : -1)),
      range(bits).map(() => 0),
    )
    .map((s) => (invert ? s < 0 : s >= 0) ? "1" : "0")
    .join("");

const gamma = parseInt(majority(data), 2);
const epsilon = ~gamma & parseInt("1".repeat(bits), 2); // bitwise inverse with mask
console.log("Part 1:", gamma * epsilon);

function search(invert?: boolean) {
  const match = range(bits).reduce(
    (acc, i) => {
      if (acc.length <= 1) return acc;
      const m = majority(acc, invert);
      return acc.filter((num) => num[i] === m[i]);
    },
    data,
  )[0];

  return parseInt(match, 2);
}

const o2GeneratorRating = search();
const co2ScrubberRating = search(true);
console.log("Part 2:", o2GeneratorRating * co2ScrubberRating);
