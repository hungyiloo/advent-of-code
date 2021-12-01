import { readLines } from "https://deno.land/std@0.116.0/io/mod.ts";
import * as path from "https://deno.land/std@0.116.0/path/mod.ts";

/**
 * Yields all the depth measurements from the input
 */
async function* depths() {
  const filename = path.join(Deno.cwd(), "./01.input.txt");
  const fileReader = await Deno.open(filename);
  for await (const line of readLines(fileReader)) {
    yield parseInt(line);
  }
}

/**
 * Yields a sliding window of elements from another generator source
 */
async function* slidingWindow<T>(
  generator: AsyncGenerator<T>,
  windowSize: number,
) {
  const win: T[] = [];

  for await (const element of generator) {
    win.push(element);
    if (win.length === windowSize) {
      yield [...win];
      win.shift();
    }
  }
}

/**
 * Count the number of adjacent increases in a generated sequence of numbers
 **/
async function countIncreases(numberGenerator: AsyncGenerator<number>) {
  let increaseCount = 0;
  for await (const [x, y] of slidingWindow(numberGenerator, 2)) {
    if (y > x) increaseCount++;
  }
  return increaseCount
}

const sinkCountPart1 = await countIncreases(depths())
console.log("Part 1:", sinkCountPart1);

/**
 * Yields sums of arrays generated from another source
 */
async function* sums(arrayGenerator: AsyncGenerator<number[]>) {
  for await (const arr of arrayGenerator) {
    yield arr.reduce((acc, curr) => acc + curr);
  }
}

const sinkCountPart2 = await countIncreases(sums(slidingWindow(depths(), 3)))
console.log("Part 2:", sinkCountPart2);
