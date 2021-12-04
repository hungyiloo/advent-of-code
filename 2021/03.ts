import { range } from "../lib/array.ts";
import { getLines, toArray } from "../lib/streams.ts";

const data = await toArray(getLines("03.input.txt"));
const bits = data[0]?.length ?? 0;

const majority = (numbers: string[]) =>
  numbers
    .reduce(
      (acc, curr) => acc.map((s, i) => s + (curr[i] === "1" ? 1 : -1)),
      range(bits).map(() => 0),
    )
    .map((s) => s >= 0 ? "1" : "0")
    .join("");

const minority = (numbers: string[]) =>
  majority(numbers).split("").map((c) => c === "0" ? "1" : "0").join("");

const gamma = parseInt(majority(data), 2);
const epsilon = parseInt(minority(data), 2);
console.log("Part 1:", gamma * epsilon);

function search(fn: (numbers: string[]) => string) {
  const match = range(bits).reduce(
    (acc, i) => {
      if (acc.length <= 1) return acc;
      const m = fn(acc);
      return acc.filter((num) => num[i] === m[i]);
    },
    data,
  )[0];

  return parseInt(match, 2);
}

const o2GeneratorRating = search(majority);
const co2ScrubberRating = search(minority);
console.log("Part 2:", o2GeneratorRating * co2ScrubberRating);
