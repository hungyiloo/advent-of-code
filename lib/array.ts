/**
 * A "do what I mean" range generator.
 * If only one param is specified, it returns a zero-indexed range of that size:
 *   range(3) => [0, 1, 2]
 * If the INCLUSIVE flag is set, include the end value in the generated range:
 *   range(1, 3) => [1, 2, 3]
 * If the start/end values are provided out of order, it will still "do what you mean":
 *   range(3, 1) => [3, 2, 1]
 */
export function range(x: number, y?: number) {
  let end = y !== undefined ? y : x;
  let start = y !== undefined ? x : undefined;

  let reverse = false;
  if (start !== undefined && start > end) {
    const temp = start;
    start = end;
    end = temp;
    reverse = true;
  }

  if (y !== undefined) end++;

  const result = [...Array(end - (start ?? 0)).keys()].map((n) =>
    n + (start ?? 0)
  );
  return reverse ? result.reverse() : result;
}

export function transpose<T>(matrix: T[][]) {
  if (!matrix.length) return matrix;
  return range(matrix[0].length)
    .map((i) => matrix.map((row) => row[i]));
}

export function map<T, U>(fn: (x: T, i: number) => U) {
  return (elements: T[]) => elements.map(fn);
}

export function flatMap<T, U>(fn: (x: T, i: number) => U[]) {
  return (elements: T[]) => elements.flatMap(fn);
}

export function filter<T>(condition: (x: T) => boolean) {
  return (elements: T[]) => elements.filter(condition);
}

export function sort<T>(compareFn?: (a: T, b: T) => number) {
  return (elements: T[]) => elements.slice().sort(compareFn);
}

export function take<T>(count: number) {
  return (elements: T[]) => elements.slice(0, count);
}

export function reduce<T, U>(reducer: (acc: U, x: T, i: number) => U, seed: U) {
  return (elements: T[]) => elements.reduce(reducer, seed);
}

export function count<T>(condition?: (x: T) => boolean) {
  if (!condition) return (elements: T[]) => elements.length
  return (elements: T[]) =>
    elements.reduce((acc, curr) => acc + (condition(curr) ? 1 : 0), 0);
}

export function sum(elements: number[]) {
  return elements.reduce((acc, curr) => acc + curr)
}

export function product(elements: number[]) {
  return elements.reduce((acc, curr) => acc * curr)
}

export function average(elements: number[]) {
  return sum(elements) / elements.length
}

export function join<T>(separator: string) {
  return (elements: T[]) => elements.join(separator)
}

export function split(separator: string | RegExp, limit?: number | undefined) {
  return (str: string) => str.split(separator, limit)
}

export function min(nums: number[]) {
  return Math.min(...nums)
}

export function max(nums: number[]) {
  return Math.max(...nums)
}

export function reverse<T>(elements: T[]) {
  return elements.slice().reverse()
}

export function from<T>(elements: Iterable<T>) {
  return Array.from(elements)
}
