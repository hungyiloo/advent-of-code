import { transpose } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, reduce, then } from "../lib/streams.ts";

type Place = {
  n: number;
  marked: boolean;
};
type Board = Place[][];

const initialState = await pipe(
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

type GameState = typeof initialState;

// make a board from the lines of text that represent it
function makeBoard(lines: string[]): Board {
  return lines.reduce(
    (acc, curr) => [
      ...acc,
      curr.trim().split(/\s+/).map((x) => ({
        n: parseInt(x, 10),
        marked: false,
      } as Place)),
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
        marked: col.marked || col.n === n,
      } as Place))
    ) as Board;
}

// bingo when any row or column is fully marked
function isBingo(board: Board) {
  const allMarked = (row: Board[0]) => row.every((x) => x.marked);
  return board.some(allMarked) || transpose(board).some(allMarked);
}

// reduce over the draw numbers on the game state to play bingo
function play(state: GameState, long?: boolean) {
  return state.draws.reduce(
    (acc: GameState, n: number) => {
      // if not playing the long version, abort on the first bingo
      if (!long && acc.bingo) return acc;

      let bingo = acc.bingo;
      const mark = marker(n);
      const boards = acc.boards.map((board) => {
        // ignore a board if already bingo'd
        if (isBingo(board)) return board;

        board = mark(board);
        // if a board bingoes on this round, capture state
        if (isBingo(board)) {
          bingo = { board, n };
        }

        return board;
      });

      return { ...acc, boards, bingo };
    },
    state,
  );
}

// score the game state according to AoC answer requirements
function scoreGame(state: GameState) {
  if (!state.bingo) return -1;
  const unmarkedPlaces = state.bingo.board
    .flatMap((x) => x)
    .reduce((sum, place) => sum + (place.marked ? 0 : place.n), 0);
  return unmarkedPlaces * state.bingo.n;
}

const part1EndState = play(initialState);
console.log("Part 1:", scoreGame(part1EndState));

const part2EndState = play(initialState, true);
console.log("Part 2:", scoreGame(part2EndState));
