export const PORT = 3000;
export const VERSION = "1.0.0";

/** Player joins the game with their display name */
export type ClientJoin = [version: typeof VERSION, type: "JOIN", name: string];

/** Player moves to location (x, y) */
export type ClientMove = [version: typeof VERSION, type: "MOVE", x: number, y: number];

/** Player changes head angle in radians */
export type ClientHead = [version: typeof VERSION, type: "AIM", angle: number];

/** Player votes to start the game (or take away their vote) */
export type ClientVote = [version: typeof VERSION, type: "VOTE", should_start: boolean];

/** Player digs at tile (x, y) */
export type ClientDig = [version: typeof VERSION, type: "DIG", x: number, y: number];

/** Player shoots a ball at an angle */
export type ClientShoot = [version: typeof VERSION, type: "AIM", angle: number];

/** Game starts */
export type ServerGameStarted = [version: typeof VERSION, type: "START"];

/** Server updates player location */
export type ServerPlayerMoved = [version: typeof VERSION, type: "MOVE", x: number, y: number, id: string];

/** Server updates player aim angle */
export type ServerPlayerAimed = [version: typeof VERSION, type: "AIM", id: string, angle: number];

/** Full game state sync from server to clients */
export type ServerGameSync = [
  version: typeof VERSION,
  type: "SYNC",
  world: number[][],
  players: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
  }>,
];

/** Game ends, winnerId is null if draw */
export type ServerGameOver = [version: typeof VERSION, type: "OVER", winnerId: string | null];

export type ClientMessage = ClientJoin | ClientMove | ClientVote | ClientDig
export type ServerMessage = ServerGameSync | ServerGameStarted | ServerGameOver;
export type Message = ClientMessage | ServerMessage
