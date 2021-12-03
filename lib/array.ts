export function range(end: number, start?: number) {
  return new Array(end).fill(null).map((_, i) => i + (start ?? 0));
}
