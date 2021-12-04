import { range } from "../lib/array.ts";
import { getLines, toArray } from "../lib/streams.ts";

const data = await toArray(getLines("03.input.txt"));
const bits = data[0]?.length ?? 0;

function majorityBits(numbers: string[], invert?: boolean) {
  return numbers
    .reduce(
      (acc, curr) => acc.map((s, i) => s + (curr[i] === "1" ? 1 : -1)),
      range(bits).map(() => 0),
    )
    .map((s) => (invert ? s < 0 : s >= 0) ? "1" : "0")
    .join("");
}

const gamma = parseInt(majorityBits(data), 2);
const epsilon = ~gamma & parseInt("1".repeat(bits), 2); // bitwise inverse with mask
console.log("Part 1:", gamma * epsilon);

async function search(invert?: boolean) {
  const match = range(bits).reduce(
    (acc, i) => {
      if (acc.length <= 1) return acc
      const majority = majorityBits(acc, invert);
      return acc.filter((num) => num[i] === majority[i]);
    },
    data
  )[0];

  return parseInt(match, 2)
}

const o2GeneratorRating = await search();
const co2ScrubberRating = await search(true);
console.log("Part 2:", o2GeneratorRating * co2ScrubberRating);
