import { transpose } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, reduce, then } from "../lib/streams.ts";

type Board = {
  n: number;
  mark: boolean;
}[][];

const startState = await pipe(
  getLines("04.input.txt"),
  // build the game state by reducing over input lines
  reduce(
    (acc, line, i) => {
      if (i === 0) {
        return {
          ...acc,
          draws: line.split(",").map((x) => parseInt(x, 10)),
        };
      }
      if (acc.unprocessed.length > 0 && line.trim() === "") {
        return {
          ...acc,
          boards: [...acc.boards, makeBoard(acc.unprocessed)],
          unprocessed: [],
        };
      }
      if (line.trim() !== "") {
        return {
          ...acc,
          unprocessed: [...acc.unprocessed, line],
        };
      }
      return acc;
    },
    {
      draws: [] as number[],
      boards: [] as Board[],
      unprocessed: [] as string[],
    },
  ),
  // final cleanup pass, ready for playing
  then(({ draws, boards, unprocessed }) => ({
    draws,
    boards: [...boards, makeBoard(unprocessed)],
    bingo: undefined as {
      board: Board;
      n: number;
    } | undefined,
  })),
);

type GameState = typeof startState;

// make a board from the lines of text that represent it
function makeBoard(lines: string[]): Board {
  return lines.reduce(
    (acc, curr) => [
      ...acc,
      curr.trim().split(/\s+/).map((x) => ({
        n: parseInt(x, 10),
        mark: false,
      })),
    ],
    [] as Board,
  );
}

// create a marker that marks a board for value N
function marker(n: number) {
  return (board: Board) =>
    board.map((row) =>
      row.map((col) => ({
        n: col.n,
        mark: col.mark || col.n === n,
      }))
    ) as Board;
}

function isBingo(board: Board) {
  const allMarked = (row: Board[0]) => row.every((x) => x.mark);
  return board.some(allMarked) || transpose(board).some(allMarked);
}

function playReducer(long?: boolean) {
  return (acc: GameState, n: number) => {
    if (!long && acc.bingo) return acc;

    let bingo = acc.bingo;
    const mark = marker(n);
    const boards = acc.boards.map((board) => {
      if (isBingo(board)) return board;

      board = mark(board);
      if (isBingo(board)) {
        bingo = { board, n };
      }

      return board;
    });

    return { ...acc, boards, bingo };
  };
}

function scoreGame(state: GameState) {
  if (!state.bingo) return -1;
  let unmarkedPlaces = 0;
  state.bingo.board.forEach((row) =>
    row.forEach((place) => {
      if (!place.mark) {
        unmarkedPlaces += place.n;
      }
    })
  );
  return unmarkedPlaces * state.bingo.n;
}

const part1EndState = startState.draws.reduce(playReducer(), startState);
console.log("Part 1:", scoreGame(part1EndState));

const part2EndState = startState.draws.reduce(playReducer(true), startState);
console.log("Part 2:", scoreGame(part2EndState));
