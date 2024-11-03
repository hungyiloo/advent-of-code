const puzzleInput = (await Deno.readTextFile("../../input/2022/04.txt")).trim();

interface Range { lo: number; hi: number; }
interface Pair { left: Range; right: Range; }

const pairs: Pair[] = puzzleInput
  .split(/\r?\n/)
  .map(line => line
    .split(',')
    .map(member => member.split('-').map(x => parseInt(x)))
    .map(([lo, hi]) => ({ lo, hi } as Range))
  )
  .map(([left, right]) => ({ left, right } as Pair));

const within = (x: number, range: Range) =>
  range.lo <= x && x <= range.hi;

const isRedundant = ({ left, right }: Pair) =>
  (within(left.lo, right) && within(left.hi, right))
  || (within(right.lo, left) && within(right.hi, left));

const isOverlap = ({ left, right }: Pair) =>
  (within(left.lo, right) || within(left.hi, right))
  || (within(right.lo, left) || within(right.hi, left));

const part1 = pairs.filter(isRedundant).length;

const part2 = pairs.filter(isOverlap).length;

console.log("Part 1:", part1);
console.log("Part 2:", part2);
