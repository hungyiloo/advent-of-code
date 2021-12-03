import { pipe } from "../lib/pipe.ts";
import { getLines, map, reduce, slidingWindow } from "../lib/streams.ts";

const depths = () =>
  pipe(
    getLines("01.input.txt"),
    map(parseInt),
  );

const upticks = (numbers$: ReturnType<typeof depths>) => pipe(
  numbers$,
  slidingWindow(2),
  reduce(
    (uptickCount, [x, y]) => uptickCount + (y > x ? 1 : 0),
    0,
  )
)

const sinkCountPart1 = await upticks(depths());
console.log("Part 1:", sinkCountPart1);

const sinkCountPart2 = await pipe(
  depths(),
  slidingWindow(3),
  map((arr) => arr.reduce((a, x) => a + x)),
  upticks,
);
console.log("Part 2:", sinkCountPart2);
