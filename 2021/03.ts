import { range } from "../lib/array.ts";
import { getLines, map, from, pop, reduce, toArray } from "../lib/streams.ts";

const data = () =>
  map(
    getLines("03.input.txt"),
    (x) => x.split("") as ("1" | "0")[],
  );

const bits = (await pop(data()))?.length ?? 0

const tallyBits = (numbers: ReturnType<typeof data>) =>
  reduce(
    numbers,
    (acc, curr) =>
      acc.map((tally, i) => ({
        one: tally.one + (curr[i] === "1" ? 1 : 0),
        zero: tally.zero + (curr[i] === "0" ? 1 : 0),
      })),
    new Array(bits).fill(null).map(() => ({
      one: 0,
      zero: 0,
    })),
  );

function chooseBit(
  reportElement: { one: number; zero: number },
  invert?: boolean,
): "1" | "0" {
  return (invert
      ? reportElement.zero > reportElement.one
      : reportElement.one >= reportElement.zero)
    ? "1"
    : "0";
}

const gamma = parseInt(
  (await tallyBits(data()))
    .map((x) => chooseBit(x))
    .join(""),
  2,
);

const epsilon = ~gamma & parseInt("1".repeat(bits), 2);

console.log("Part 1:", gamma * epsilon);

async function search(invert?: boolean) {
  let filteredNumbers = await toArray(data());
  let tallies = await tallyBits(from(filteredNumbers));

  for (const i of range(bits)) {
    const common = chooseBit(tallies[i], invert);
    filteredNumbers = filteredNumbers.filter((num) => num[i] === common);
    tallies = await tallyBits(from(filteredNumbers));
    if (filteredNumbers.length <= 1) break;
  }

  const result = filteredNumbers[0];
  return result ? parseInt(result.join(""), 2) : 0;
}

const o2GeneratorRating = await search();
const co2ScrubberRating = await search(true);

console.log("Part 2:", o2GeneratorRating * co2ScrubberRating);
