export function memoize<T, U>(fn: (x: T) => U) {
  const memo = new Map<T, U>();
  return (x: T) => {
    if (memo.has(x)) return memo.get(x)!;
    const result = fn(x);
    memo.set(x, result);
    return result;
  };
}
