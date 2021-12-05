import { pipe } from "../lib/pipe.ts";
import { count, getLines, map, slidingWindow } from "../lib/streams.ts";

const depths = () =>
  pipe(
    getLines("01.input.txt"),
    map(Number),
  );

const upticks = (numbers$: ReturnType<typeof depths>) =>
  pipe(
    numbers$,
    slidingWindow(2),
    count(([x, y]) => x < y)
  );

const sinkCountPart1 = await upticks(depths());
console.log("Part 1:", sinkCountPart1);

const sinkCountPart2 = await pipe(
  depths(),
  slidingWindow(3),
  map((arr) => arr.reduce((a, x) => a + x)),
  upticks,
);
console.log("Part 2:", sinkCountPart2);
