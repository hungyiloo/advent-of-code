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
export function map$<T, U>(fn: (x: T, i: number) => U) {
  return async function* (elements$: AsyncIterableIterator<T>) {
    let index = 0;
    for await (const element of elements$) {
      yield fn(element, index);
      index++;
    }
  };
}

/**
 * Yields a sliding window of elements of a given window size
 */
export function slidingWindow$<T>(windowSize: number) {
  return async function* (elements$: AsyncIterableIterator<T>) {
    const win: T[] = [];

    for await (const element of elements$) {
      win.push(element);
      if (win.length === windowSize) {
        yield [...win];
        win.shift();
      }
    }
  };
}

/**
 * Reduce over a stream of values to a single output value
 */
export function reduce$<T, U>(
  reducer: (a: U, x: T, i: number) => U,
  initialValue: U,
) {
  return async function (elements$: AsyncIterableIterator<T>) {
    let accumulator = initialValue;
    let index = 0;
    for await (const element of elements$) {
      accumulator = reducer(accumulator, element, index);
      index++;
    }
    return accumulator;
  };
}

/**
 * Count the number of values in a stream matching an optional condition
 */
export function count$<T>(condition?: (x: T) => boolean) {
  return reduce$<T, number>(
    (acc, curr) => acc + ((condition?.(curr) ?? true) ? 1 : 0),
    0
  )
}

/**
 * Count the number of values in a stream based on a condition
 */
export function partition$<T>(condition: (x: T) => boolean) {
  return reduce$<T, [T[], T[]]>(
    (acc, curr) => {
      condition(curr) ? acc[0].push(curr) : acc[1].push(curr)
      return acc
    },
    [[], []]
  )
}

/**
 * Converts any regular iterable into an async iterable iterator
 */
export async function* from$<T>(elements: Iterable<T> | Promise<Iterable<T>>) {
  elements = await Promise.resolve(elements);
  for (const element of elements) {
    yield element;
  }
}

/**
 * Converts any regular value into an async iterable iterator
 */
export async function* of<T>(element: T | Promise<T>) {
  element = await Promise.resolve(element);
  yield element
}

/**
 * Yields elements filtered through a query function
 */
export function filter$<T>(fn: (x: T) => boolean) {
  return async function* (elements$: AsyncIterableIterator<T>) {
    for await (const element of elements$) {
      if (fn(element)) {
        yield element;
      }
    }
  };
}

/**
 * Convert a stream of elements to an in-memory array
 */
export async function toArray$<T>(
  elements$: AsyncIterableIterator<T>,
) {
  const arr: T[] = [];
  for await (const element of elements$) {
    arr.push(element);
  }
  return arr;
}

/**
 * Take N elements from the stream
 */
export function take$<T>(n: number) {
  return async function* (elements$: AsyncIterableIterator<T>) {
    let count = 0;
    for await (const element of elements$) {
      yield element;
      count++;
      if (count === n) break;
    }
  };
}

/**
 * Gets the first value off a stream, or undefined if unable
 */
export async function pop$<T>(
  elements$: AsyncIterableIterator<T>,
) {
  return (await elements$.next())!.value as T;
}

export function then<T, U>(fn: (x: T) => U) {
  return async (p: T | Promise<T>) => fn(await Promise.resolve(p));
}

export function min$(numbers$: AsyncIterableIterator<number>) {
  return reduce$((acc, curr: number) => curr < acc ? curr : acc, Infinity)(numbers$)
}

export function max$(numbers$: AsyncIterableIterator<number>) {
  return reduce$((acc, curr: number) => curr > acc ? curr : acc, -Infinity)(numbers$)
}

export function sum$(numbers$: AsyncIterableIterator<number>) {
  return reduce$((acc, curr: number) => acc + curr, 0)(numbers$)
}
