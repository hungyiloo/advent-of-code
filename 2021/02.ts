import { getLines, map, reduce } from "./lib.ts";

enum Direction {
  Forward = "forward",
  Down = "down",
  Up = "up",
}

const vectors = () =>
  map(
    getLines("02.input.txt"),
    (line) => {
      const parts = line.split(" ");
      return [parts[0], parseInt(parts[1])] as [Direction, number];
    },
  );

const finalState = await reduce(
  vectors(),
  (state, [direction, x]) => {
    switch (direction) {
      case Direction.Forward:
        return { ...state, position: state.position + x };
      case Direction.Down:
        return { ...state, depth: state.depth + x };
      case Direction.Up:
        return { ...state, depth: state.depth - x };
      default:
        return state;
    }
  },
  {
    position: 0,
    depth: 0,
  },
);
console.log("Part 1:", finalState.position * finalState.depth);

const finalStateWithAim = await reduce(
  vectors(),
  (state, [direction, x]) => {
    switch (direction) {
      case Direction.Forward:
        return {
          ...state,
          position: state.position + x,
          depth: state.depth + state.aim * x,
        };
      case Direction.Down:
        return { ...state, aim: state.aim + x };
      case Direction.Up:
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
);
console.log(
  "Part 2:",
  finalStateWithAim.position * finalStateWithAim.depth,
);
