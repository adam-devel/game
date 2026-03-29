import {
  Board,
  Illigal,
  Move,
  O,
  Tie,
  Turn,
  TurnOver,
  Win,
  X,
} from "./types.ts";

export function make_board(n: number): Board {
  const board: Board = [];
  for (let l = 0; l < n; l++) {
    board[l] = [];
    for (let c = 0; c < n; c++) {
      board[l][c] = null;
    }
  }
  return board;
}

export function play(b: Board, t: Turn, { line, col }: Move) {
  // validate the move
  if (line < 0 || line >= b.length) {
    return Illigal; // the "line" part of the move is out of bounds
  }
  if (col < 0 || col >= b[line].length) {
    return Illigal; // the "col" part of the move is out of bounds
  }
  if (b[line][col] !== null) {
    return Illigal; // refusing to overwrite an already occupied cell
  }

  // accept the move
  b[line][col] = t;

  // check for wins
  if (
    horizontalWin() || verticalWin() || diagonalWin() || oppositeDiagonalWin()
  ) return Win;
  function horizontalWin(): boolean {
    return b[line].every((cell) => cell === t);
  }
  function verticalWin(): boolean {
    return b.every((l) => l[col] === t);
  }
  function diagonalWin(): boolean {
    return b.every((row, rowIdx) => row[rowIdx] === t);
  }
  function oppositeDiagonalWin(): boolean {
    return b.every((row, rowIdx) => row[row.length - rowIdx - 1] === t);
  }

  // check for tie: implied by having no empty cells left.
  if (!b.some((l) => l.some((c) => c === null))) {
    return Tie;
  }

  // the game isn't over, switch turns
  return TurnOver;
}

export * from "./types.ts";
