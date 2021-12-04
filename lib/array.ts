export function range(n: number) {
  return [...Array(n).keys()]
}

export function transpose<T>(matrix: T[][]) {
  if (!matrix.length) return matrix;
  return range(matrix[0].length)
    .map((i) => matrix.map(row => row[i]))
}
