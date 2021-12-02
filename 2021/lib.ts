import { readLines } from "https://deno.land/std@0.116.0/io/mod.ts";
import * as path from "https://deno.land/std@0.116.0/path/mod.ts";

/**
 * Yields all lines of text from an input file
 */
export async function* getLines(inputFilePath: string) {
  const filename = path.join(Deno.cwd(), inputFilePath);
  const fileReader = await Deno.open(filename);
  for await (const line of readLines(fileReader)) {
    yield line;
  }
}

/**
 * Yields elements mapped through a transformation function
 */
export async function* map<T, U>(
  elements$: AsyncIterableIterator<T>,
  fn: (x: T) => U,
) {
  for await (const element of elements$) {
    yield fn(element);
  }
}

/**
 * Yields a sliding window of elements of a given window size
 */
export async function* slidingWindow<T>(
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
 * Reduce over a stream of values to a single output value
 */
export async function reduce<T, U>(
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
