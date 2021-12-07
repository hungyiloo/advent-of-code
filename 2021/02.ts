import { pipe } from "../lib/pipe.ts";
import { getLines, map$, reduce$ } from "../lib/streams.ts";

type Direction = "forward" | "up" | "down";

const vectors = () =>
  pipe(
    getLines("02.input.txt"),
    map$((line) => line.split(" ")),
    map$(([p1, p2]) => [p1, parseInt(p2)] as [Direction, number]),
  );

const part1 = await pipe(
  vectors(),
  reduce$(
    (state, [direction, x]) => {
      switch (direction) {
        case "forward":
          // add X to position
          return { ...state, position: state.position + x };
        case "down":
          // add X to depth
          return { ...state, depth: state.depth + x };
        case "up":
          // subtract X from depth
          return { ...state, depth: state.depth - x };
        default:
          return state;
      }
    },
    {
      position: 0,
      depth: 0,
    },
  ),
);
console.log("Part 1:", part1.position * part1.depth);

const part2 = await pipe(
  vectors(),
  reduce$(
    (state, [direction, x]) => {
      switch (direction) {
        case "forward":
          // add X to position and recalc depth based on aim
          return {
            ...state,
            position: state.position + x,
            depth: state.depth + state.aim * x,
          };
        case "down":
          // add X to aim
          return { ...state, aim: state.aim + x };
        case "up":
          // subtract X from aim
          return { ...state, aim: state.aim - x };
        default:
          return state;
      }
    },
    {
      position: 0,
      depth: 0,
      aim: 0,
    },
  ),
);
console.log("Part 2:", part2.position * part2.depth);
