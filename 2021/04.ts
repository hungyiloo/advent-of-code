import { transpose } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, reduce } from "../lib/streams.ts";

type BoardPlace = {
  n: number;
  marked: boolean;
};
type BoardLine = BoardPlace[];
type Board = BoardLine[];

const initialState = await pipe(
  getLines("04.input.txt"),
  // build the game state by reducing over input lines
  reduce(
    (acc, line, i) => {
      // split the first line into draw numbers
      if (i === 0) acc.draws = line.split(",").map(Number);
      // on every non blank line, add it to the last board
      else if (line.trim() !== "") acc.boards[0].push(makeBoardLine(line));
      // on every blank line, start a new board
      else acc.boards = [[], ...acc.boards];
      return acc;
    },
    {
      draws: [] as number[],
      boards: [] as Board[],
      bingo: undefined as { board: Board; n: number } | undefined,
    },
  ),
);

type GameState = typeof initialState;

// make a board line from the line of text that represents it
function makeBoardLine(line: string): BoardLine {
  return line.trim().split(/\s+/).map((x) => ({
    n: parseInt(x, 10),
    marked: false,
  } as BoardPlace));
}

// create a marker that marks a board for value N
function markBoard(board: Board, n: number) {
  return board.map((row) =>
    row.map((col) => ({
      n: col.n,
      marked: col.marked || col.n === n,
    } as BoardPlace))
  ) as Board;
}

// bingo when any board line is fully marked
function isBingo(board: Board) {
  const allMarked = (row: BoardLine) => row.every((x) => x.marked);
  return board.some(allMarked) || transpose(board).some(allMarked);
}

// score the game state according to AoC answer requirements
function scoreGame(state: GameState) {
  if (!state.bingo) return -1;
  const unmarkedPlaces = state.bingo.board
    .flatMap((x) => x)
    .reduce((sum, place) => sum + (place.marked ? 0 : place.n), 0);
  return unmarkedPlaces * state.bingo.n;
}

// reduce over the draw numbers on the game state to play bingo, then score
function play(state: GameState, stopOnBingo?: boolean) {
  const endState = state.draws.reduce(
    (acc: GameState, n: number) => {
      // abort on the first bingo if we're playing that way
      if (stopOnBingo && acc.bingo) return acc;

      let bingo = acc.bingo;
      const boards = acc.boards.map((board) => {
        // ignore a board if already bingo'd
        if (isBingo(board)) return board;
        board = markBoard(board, n);
        // if a board bingoes on this round, capture state
        if (isBingo(board)) bingo = { board, n };
        return board;
      });

      return { ...acc, boards, bingo };
    },
    state,
  );

  return scoreGame(endState);
}

console.log("Part 1:", play(initialState, true));
console.log("Part 2:", play(initialState));
