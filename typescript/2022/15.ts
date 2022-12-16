const puzzleInput = (await Deno.readTextFile("../../input/2022/15.txt")).trim();

type Point = { x: number; y: number };
type Circle = Point & { radius: number };
type Range = { lo: number; hi: number };

const manhattan = (x1: number, y1: number, x2: number, y2: number) =>
  Math.abs(x1 - x2) + Math.abs(y1 - y2);

const FIELD = puzzleInput
  .split("\n")
  .map((line) => line.replace(/(Sensor at|x=|y=|closest beacon is at| )/g, ""))
  .map((line) => line.split(/[,:]/).map(Number));

const CIRCLES = FIELD
  .map(([sensorX, sensorY, beaconX, beaconY]) => ({
    x: sensorX,
    y: sensorY,
    radius: manhattan(sensorX, sensorY, beaconX, beaconY),
  } as Circle));

const BEACONS = [...new Map(
  FIELD.map(([, , beaconX, beaconY]) => [
    `${beaconX},${beaconY}`,
    {
      x: beaconX,
      y: beaconY,
    } as Point,
  ]),
).values()];

const compareRange = (a: Range, b: Range) =>
  a.lo !== b.lo ? a.lo - b.lo : a.hi - b.hi;

const union = (...ranges: Range[]) => {
  if (!ranges || ranges.length === 0) return [];
  return ranges
    .sort(compareRange)
    .slice(1)
    .reduce(
      (acc, curr) => {
        const prev = acc[acc.length - 1];
        if (prev.hi >= curr.lo) {
          prev.hi = Math.max(prev.hi, curr.hi);
          return acc;
        } else {
          return [...acc, curr];
        }
      },
      [ranges[0]],
    );
};

const chordAt = (circle: Circle, y: number) => {
  const yDistance = Math.abs(y - circle.y);
  if (yDistance > circle.radius) return undefined;
  const delta = circle.radius - yDistance;
  return {
    lo: circle.x - delta,
    hi: circle.x + delta,
  } as Range;
};

const within = (x: number, { lo, hi }: Range) => lo <= x && x <= hi;

const coverageAt = (y: number) =>
  union(
    ...CIRCLES
      .map((circle) => chordAt(circle, y))
      .filter((r) => !!r) as Range[],
  );

const part1 = (() => {
  const Y = 2_000_000;
  const ranges = coverageAt(Y);
  const beaconsInRange = BEACONS
    .filter((b) => b.y === Y && ranges.some((r) => within(b.x, r)))
    .length;
  const covered = ranges.reduce((sum, { lo, hi }) => sum + hi - lo + 1, 0);
  return covered - beaconsInRange;
})();

const part2 = (() => {
  const LIMIT = 4_000_000;
  for (let y = 0; y <= LIMIT; y++) {
    const ranges = coverageAt(y);
    const found = ranges.find((r) => within(r.hi, { lo: 0, hi: LIMIT }));
    if (found) {
      return (found.hi + 1) * LIMIT + y;
    }
  }
})();

console.log("Part 1:", part1);
console.log("Part 2:", part2);
