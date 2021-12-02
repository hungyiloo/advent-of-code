import { getLines, map, reduce, slidingWindow } from "./lib.ts";

const depths = () => map(getLines("01.input.txt"), parseInt);

const upticks = (numbers$: AsyncIterableIterator<number>) =>
  reduce(
    slidingWindow(numbers$, 2),
    (uptickCount, [x, y]) => uptickCount + (y > x ? 1 : 0),
    0,
  );

const sinkCountPart1 = await upticks(depths());
console.log("Part 1:", sinkCountPart1);

const sinkCountPart2 = await upticks(
  map(
    slidingWindow(
      depths(),
      3,
    ),
    (arr) => arr.reduce((a, x) => a + x),
  ),
);
console.log("Part 2:", sinkCountPart2);
