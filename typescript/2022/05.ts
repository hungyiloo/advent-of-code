const puzzleInput = (await Deno.readTextFile("../../input/2022/05.txt")).trim();

const lines: string[] = puzzleInput.split('\n');
const blankLinePosition = lines.findIndex(line => line === '');
const stackData = lines.slice(0, blankLinePosition - 1);
const stackIds = lines[blankLinePosition - 1];
const moveData = lines.slice(blankLinePosition + 1);

const moves = moveData
  // split on either "move ", " from " or " to "
  .map(move => move.split(/(move | from | to )/))
  // use blanks in destructuring to skip unimportant parts
  .map(([,,amount,, from,, to]) => ({
    amount: parseInt(amount),
    from,
    to
  }));

const makeStackMap = () =>
  stackIds.split('').reduce(
    (stacks, stackId, ii) => {
      if (stackId?.trim() !== '') {
        // For each non-empty stack ID
        // get its place index (ii)
        stacks.set(
          stackId,
          // find all the letters in the
          // stack data in place ii
          stackData
            .map(row => row[ii]?.trim())
            .filter(x => !!x)
        )
      }
      return stacks;
    },
    new Map<string, string[]>()
  );

const getTopLetters = (stackMap: Map<string, string[]>) =>
  Array.from(stackMap.values())
    .map(stack => stack[0])
    .join('');

const simulate = (reverse: boolean) => {
  const stacks = makeStackMap();

  for (const {amount, from, to} of moves) {
    const fromStack = stacks.get(from)!;
    const toStack = stacks.get(to)!;
    const transfer = fromStack.splice(0, amount)
    if (reverse) transfer.reverse();
    toStack.splice(0, 0, ...transfer);
  }

  return getTopLetters(stacks);
}

const part1 = simulate(true);
const part2 = simulate(false);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
