export type Board = Array<Array<Mark>>
export enum Mark {
  X = "X",
  O = "O",
}

// type-discrimination
export enum MessageType {
  ClientMessage = 1,
  ServerMessage = 10,
}

// every message must extend this
export interface BaseMessage {
  version: 1;
  type: MessageType;    // enum for runtime discrimination
}

// Client sends inputs
export interface ClientMessage extends BaseMessage {
  type: MessageType.ClientMessage;
  playerId: number;
  line: number;
  col: number;
}

// Server sends state of the world
export interface ServerMessage extends BaseMessage {
  type: MessageType.ServerMessage;
  board: Board
}
