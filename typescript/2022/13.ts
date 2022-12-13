const puzzleInput = (await Deno.readTextFile("../../input/2022/13.txt")).trim();

type Packet = number | Packet[];

const pairs = puzzleInput
  .split('\n\n')
  .map(lines => lines
  .split('\n')
  .map(line => JSON.parse(line) as Packet));

const isNumber = (x: Packet) => typeof x === 'number';

// Standard comparison function, implemented for comparing packets.
// i.e. returns -1 for "in the right order"
//      returns 1 for "not in the right order"
//      returns 0 for "continue checking the next part"
// These values allow us to sort() an array of Packets
const CORRECT = -1;
const INCORRECT = 1;
const INDETERMINATE = 0;
const compare = (left: Packet, right: Packet): number => {
  if (isNumber(left) && isNumber(right)) {
    // left and right are plain numbers
    return left < right ? CORRECT
      : left > right ? INCORRECT
      : INDETERMINATE;
  } else if (isNumber(left) && !isNumber(right)) {
    // left is plain number
    return compare([left], right);
  } else if (!isNumber(left) && isNumber(right)) {
    // right is plain number
    return compare(left, [right]);
  } else {
    // left and rignt are both lists of Packets
    const lefts = left as Packet[];
    const rights = right as Packet[];

    const result = lefts.reduce<number>(
      (result, l, i) => {
        if (result !== INDETERMINATE) return result;
        const r = rights[i];
        // check if right side ran out of items
        if (!r) return INCORRECT;
        return compare(l, r);
      },
      INDETERMINATE
    );

    // check if left side ran out of items
    if (result === INDETERMINATE && rights.length > lefts.length)
      return CORRECT;
    else
      return result;
  }
}

const part1 = pairs.reduce(
  (acc, [left, right], ii) =>
    compare(left, right) === CORRECT
    ? acc + ii + 1
    : acc,
  0
);

const packets = pairs
  .flatMap(pair => pair)  // flatten
  .concat([[[2]], [[6]]]) // add dividers
  .sort(compare);         // sort

const dividerPos1 = packets.findIndex(x => JSON.stringify(x) === '[[2]]') + 1;
const dividerPos2 = packets.findIndex(x => JSON.stringify(x) === '[[6]]') + 1;

const part2 = dividerPos1 * dividerPos2;

console.log('Part 1:', part1);
console.log('Part 2:', part2);
