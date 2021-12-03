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

/**
 * Converts any regular iterable into an async iterable iterator
 **/
export async function* of<T>(elements: Iterable<T>) {
  for (const element of elements) {
    yield element
  }
}

/**
 * Yields elements filtered through a query function
 */
export async function* filter<T>(
  elements$: AsyncIterableIterator<T>,
  fn: (x: T) => boolean,
) {
  for await (const element of elements$) {
    if (fn(element)) {
      yield element
    }
  }
}

/**
 * Convert a stream of elements to an in-memory array
 */
export async function toArray<T>(
  elements$: AsyncIterableIterator<T>
) {
  const arr: T[] = []
  for await (const element of elements$) {
    arr.push(element)
  }
  return arr;
}

/**
 * Take N elements from the stream
 */
export async function* take<T>(
  elements$: AsyncIterableIterator<T>,
  n: number
) {
  let count = 0
  for await (const element of elements$) {
    yield element;
    count++;
    if (count === n) break;
  }
}

/**
 * Gets the first value off a stream, or undefined if unable
 */
export async function pop<T>(
  elements$: AsyncIterableIterator<T>,
) {
  return (await elements$.next())?.value as T | undefined
}
