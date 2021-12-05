import { transpose } from "../lib/array.ts";
import { pipe } from "../lib/pipe.ts";
import { getLines, reduce } from "../lib/streams.ts";

type BoardPlace = number | null;
type BoardLine = BoardPlace[];
type Board = BoardLine[];
interface GameState {
  draws: number[];
  boards: Board[];
  bingo?: { board: Board; n: number };
}

const makeInitialGameState = () =>
  pipe(
    getLines("04.input.txt"),
    // build the game state by reducing over input lines
    reduce(
      (acc, line, i) => {
        // split the first line into draw numbers
        if (i === 0) acc.draws = line.split(",").map(Number);
        // on every blank line, start a new board
        else if (line.trim() === "") acc.boards.unshift([]);
        // on every non blank line, add it to the last board
        else acc.boards[0].push(line.trim().split(/\s+/).map(Number));
        return acc;
      },
      { draws: [], boards: [] } as GameState,
    ),
  );

// bingo when any board line is fully marked
// note: transposing the board lets us check columns too
function isBingo(board: Board) {
  const lineMarked = (line: BoardLine) => line.every((x) => x === null);
  return board.some(lineMarked) || transpose(board).some(lineMarked);
}

// destructively mark a board for value N and check for bingo
// note: marking a place will set it to null
function markAndCheckBingo(board: Board, n: number) {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === n) board[i][j] = null;
    }
  }
  return isBingo(board);
}

// score the game state according to AoC answer requirements
function scoreGame(state: GameState) {
  if (!state.bingo) return -1;
  return state.bingo.n * state.bingo.board
    .flatMap((line) => line.map((place) => place ?? 0))
    .reduce((sum, place) => sum + place, 0);
}

async function playBingo(stopOnBingo?: boolean) {
  const state = await makeInitialGameState();

  for (const n of state.draws) {
    // abort on the first bingo if we're playing that way
    if (stopOnBingo && state.bingo) break;

    for (const board of state.boards) {
      // ignore a board if already bingo'd
      if (isBingo(board)) continue;
      // if a board bingo's on this round, capture state
      if (markAndCheckBingo(board, n)) {
        state.bingo = { board, n };
      }
    }
  }

  return scoreGame(state);
}

console.log("Part 1:", await playBingo(true));
console.log("Part 2:", await playBingo());
