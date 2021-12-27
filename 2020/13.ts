import { filter, map, reduce, split } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, pop$ } from "../lib/streams.ts";

const inputData$ = getLines("13.input.txt");
const timestampRaw = await pop$(inputData$);
const scheduleRaw = await pop$(inputData$);

if (!timestampRaw || !scheduleRaw) Deno.exit();

const timestamp = parseInt(timestampRaw);

const schedule = pipe(
  scheduleRaw,
  split(","),
  map((x) => x === "x" ? 1 : parseInt(x, 10)),
);

pipe(
  schedule,
  filter((x) => x !== 1),
  map((busId) => ({
    busId,
    nextBusIn: (busId - (timestamp % busId)) % busId,
  })),
  reduce(
    (min, curr) => curr.nextBusIn < min.nextBusIn ? curr : min,
    { nextBusIn: Infinity, busId: 0 },
  ),
  (nextBus) => console.log("Part 1:", nextBus.busId * nextBus.nextBusIn),
);

pipe(
  schedule,
  map((busId, position) => ({ busId, position })),
  reduce(({ t, period }, { busId, position }) => {
    while ((t + position) % busId !== 0) t += period;
    return { t, period: period * busId };
  }, { t: 0, period: 1 }),
  ({ t }) => console.log("Part 2:", t),
);
