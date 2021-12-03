import { range } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { from, getLines, pop, reduce, toArray } from "../lib/streams.ts";

const data = () => getLines("03.input.txt");

const bits = (await pipe(data(), pop))?.length ?? 0;

async function majorityBits(numbers: ReturnType<typeof data>, invert?: boolean) {
  const scores = await pipe(
    numbers,
    reduce(
      (acc, curr) => acc.map((s, i) => s + (curr[i] === "1" ? 1 : -1)),
      range(bits).map(() => 0),
    ),
  );
  return scores
    .map((s) => (invert ? s < 0 : s >= 0) ? "1" : "0")
    .join("");
}

const gamma = parseInt(await majorityBits(data()), 2);
const epsilon = ~gamma & parseInt("1".repeat(bits), 2);
console.log("Part 1:", gamma * epsilon);

async function search(invert?: boolean) {
  let filteredNumbers = await toArray(data());

  for (const i of range(bits)) {
    const majority = await majorityBits(from(filteredNumbers), invert);
    filteredNumbers = filteredNumbers.filter((num) => num[i] === majority[i]);
    if (filteredNumbers.length <= 1) break;
  }

  const result = filteredNumbers[0];
  return result ? parseInt(result, 2) : 0;
}

const o2GeneratorRating = await search();
const co2ScrubberRating = await search(true);
console.log("Part 2:", o2GeneratorRating * co2ScrubberRating);
