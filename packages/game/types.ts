// available turns in the game are X and O
export type Turn = typeof X | typeof O;
export const X = "X";
export const O = "O";

// turns are recorded on a board
export type Board = (Turn | null)[][];

// turns are played as a series of moves
export type Move = {
  line: number;
  col: number;
};

// possible outcomes of a move are: Win, Tie, TurnOver, or Illigal
export type Outcome = typeof Win | typeof Tie | typeof Illigal | typeof TurnOver;
export const Win = "Win";
export const Tie = "Tie";
export const TurnOver = "TurnOver";
export const Illigal = "Illigal";

// possible outcomes of a complete match are: Win for X/O or Tie
export type Gameover =
  | typeof X
  | typeof O
  | typeof Tie;
