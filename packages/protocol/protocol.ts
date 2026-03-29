import { Board, Gameover, Turn } from "@game/game";

export const PORT = 3000;
export const VERSION = "1.0.0";

export type Schema = {
  /**
   * Client sends this to join a game session.
   *
   * `wantTurn`: preferred turn to play as (null: no preference)
   * `wantFirst`: preference to play first
   */
  Join: [
    version: typeof VERSION,
    type: "JOIN",
    wantTurn: Turn | null,
    wantFirst: boolean,
  ];

  /**
   * Client sends this to make a move.
   *
   * `line`: row index (0-based)
   * `col`: column index (0-based)
   */
  Move: [version: typeof VERSION, type: "MOVE", line: number, col: number];

  /**
   * Server sends this when waiting for an opponent.
   */
  Wait: [version: typeof VERSION, type: "WAIT"];

  /**
   * Server sends this when game starts.
   *
   * `board`: initial game board
   * `yourTurn`: which turn this player controls (X or O)
   * `currentTurn`: whose turn it is to move
   */
  Start: [
    version: typeof VERSION,
    type: "START",
    board: Board,
    yourTurn: Turn,
    currentTurn: Turn,
  ];

  /**
   * Server sends this to sync game state.
   *
   * Clients may use prediction for smoother gameplay,
   * but the server remains the authority.
   */
  Sync: [
    version: typeof VERSION,
    type: "SYNC",
    board: Board,
    currentTurn: Turn,
  ];

  /**
   * Server sends this when game ends.
   *
   * `outcome`: winner (X or O) or "Tie"
   */
  Over: [version: typeof VERSION, type: "OVER", outcome: Gameover];
};

export type Message = Schema[keyof Schema];
