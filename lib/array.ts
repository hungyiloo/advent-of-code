/**
 * A "do what I mean" range generator.
 * If only one param is specified, it returns a zero-indexed range of that size:
 *   range(3) => [0, 1, 2]
 * If two values are specified, it uses them as start/end values:
 *   range(1, 3) => [1, 2]
 * If the INCLUSIVE flag is set, include the end value in the generated range:
 *   range(1, 3, true) => [1, 2, 3]
 * If the start/end values are provided out of order, it will still "do what you mean":
 *   range(3, 1) = [2, 1]
 *   range(3, 1, true) => [3, 2, 1]
 */
export function range(x: number, y?: number, inclusive?: boolean) {
  let end = y !== undefined ? y : x;
  let start = y !== undefined ? x : undefined;

  let reverse = false;
  if (start !== undefined && start > end) {
    const temp = start;
    start = end;
    end = temp;
    reverse = true;
  }

  if (inclusive) end++;

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

