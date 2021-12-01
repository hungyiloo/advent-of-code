import { readLines } from "https://deno.land/std@0.116.0/io/mod.ts";
import * as path from "https://deno.land/std@0.116.0/path/mod.ts";

/**
 * Yields all the depth measurements from the input
 */
async function* depths() {
  const filename = path.join(Deno.cwd(), "./01.input.txt");
  const fileReader = await Deno.open(filename);
  const lines$ = readLines(fileReader);
  for await (const line of lines$) {
    yield parseInt(line);
  }
}

/**
 * Yields a sliding window of elements of a given window size
 */
async function* slidingWindow<T>(
  elements$: AsyncIterableIterator<T>,
  windowSize: number,
) {
  const win: T[] = [];

  for await (const element of elements$) {
    win.push(element);
    if (win.length === windowSize) {
      yield [...win];
      win.shift();
    }
  }
}

/**
 * Yields elements mapped through a transformation function
 */
async function* map<T, U>(elements$: AsyncIterableIterator<T>, fn: (x: T) => U) {
  for await (const element of elements$) {
    yield fn(element);
  }
}

/**
 * Reduce over a stream of values to a single output value
 */
async function reduce<T, U>(
  elements$: AsyncIterableIterator<T>,
  reducer: (a: U, x: T) => U,
  initialValue: U,
) {
  let accumulator = initialValue;
  for await (const element of elements$) {
    accumulator = reducer(accumulator, element);
  }
  return accumulator;
}

/**
 * Count the number of upticks (i.e. adjacent value increases) in a stream of numbers
 */
const upticks = (numbers$: AsyncIterableIterator<number>) =>
  reduce(
    slidingWindow(numbers$, 2),
    (uptickCount, [x, y]) => y > x ? uptickCount + 1 : uptickCount,
    0,
  );

const sinkCountPart1 = await upticks(depths());
console.log("Part 1:", sinkCountPart1);

const sinkCountPart2 = await upticks(
  map(
    slidingWindow(
      depths(),
      3,
    ),
    (arr) => arr.reduce((a, x) => a + x),
  ),
);
console.log("Part 2:", sinkCountPart2);
