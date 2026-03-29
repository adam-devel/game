import { Board, Gameover, Illigal, make_board as makeBoard, O, play, Tie, Turn, TurnOver, Win, X, } from "@game/game";
import { Schema, Message, PORT, VERSION } from "@game/protocol";
import * as log from "@game/log";
import { decode, encode } from "@std/msgpack"
import { assert } from "@std/assert";

const BOARD_SIZE = 3;

let gameBoard: Board | null = null;
let gameTurn: Turn | null;

/**
 * A Player is a coupling of a `socket` and a `turn`
 *
 * a `socket` can't play without a `turn`, and
 * a `turn` can't be played without moves from a `socket`
 */
type Player = { socket: WebSocket; turn: Turn };

/** Stores complete players */
const playerRegistry = new Set<Player>();

/**
 * Identifies a "player" from a partial player `part`
 *
 * Rationale:
 *   The WebSocket api only exposes the socket part of the player object.
 *   The @game/game API only exposes the "Turn" part of the player object.
 *   In order to consume both APIs we must identify a "player" from a part.
 */
function playerGet(part: WebSocket | Turn): Player | null {
  const players = [...playerRegistry.keys()];
  const result = players.find(p => p.socket === part || p.turn === part);
  return result ?? null;
}

Deno.serve(
  { port: PORT, onListen: serverOnListen },
  (request) => {
    if (request.headers.get("upgrade") !== "websocket") {
      log.dbg("http", "request", "not websocket upgrade");
      return new Response(null, { status: 404 });
    }

    const { socket, response } = Deno.upgradeWebSocket(request);
    socket.binaryType = "arraybuffer";

    socket.addEventListener("close", () => socketHandleClose(socket));
    socket.addEventListener("message", ({ data }) =>
      socketHandleMessage(socket, new Uint8Array(data as ArrayBuffer))
    );

    return response;
  },
);

function serverOnListen({ hostname, port }: Deno.NetAddr) {
  console.log(`Server running on ws://${hostname}:${port}`);
}

function socketHandleClose(socket: WebSocket) {
  const player = playerGet(socket);
  if (!player) {
    log.info("socket", "close", "ignoring unregistered socket");
    return;
  }

  const opponent = playerGet(player.turn === X ? O : X);
  if (opponent) {
    log.info("socket", "close", "disconnecting opponent", `player=${player.turn}`);
    opponent.socket.close(1000, "Opponent Disconnected");
  } else {
    log.info("socket", "close", "player has no opponent", `player=${player.turn}`);
  }

  playerRegistry.clear();
  gameReset();
}

function socketHandleMessage(socket: WebSocket, data: Uint8Array) {
  if (socket.binaryType !== "arraybuffer") {
    log.warn("socket", "message", "ignoring non-arraybuffer message");
    return;
  }

  const msg = decode(new Uint8Array(data)) as Message;
  const [version, ...body] = msg;

  if (version !== VERSION) {
    log.warn("socket", "message", "closing socket", "version mismatch");
    socket.close(1000, "Version Mismatch");
    return;
  }

  const [type] = body;
  if (type === "JOIN") {
    const [, wantTurn, wantFirst] = body;
    messageHandleJoin(socket, wantTurn, wantFirst);
  } else if (type === "MOVE") {
    const [, line, col] = body;
    messageHandleMove(socket, line, col);
  } else {
    log.warn("socket", "message", `unknown message type: ${type}`);
  }
}

function messageHandleJoin(socket: WebSocket, wantTurn: Turn | null, wantFirst: boolean) {
  const xPlayer = playerGet(X);
  const oPlayer = playerGet(O);

  if (xPlayer && oPlayer) {
    const reason = "Game full";
    log.info("join", "full", `closing socket: ${reason}`);
    socket.close(1000, reason);
    return;
  }

  const player = playerAdd(socket, wantTurn);

  if (gameTurn === null && wantFirst) {
    gameTurn = player.turn;
  }

  const currentXPlayer = playerGet(X);
  const currentOPlayer = playerGet(O);

  if (!currentXPlayer || !currentOPlayer) {
    log.info("join", "waiting", `player=${player.turn}`);
    socket.send(encode([VERSION, "WAIT"] satisfies Schema["Wait"]));
    return;
  }

  gameTurn = gameTurn ?? X;
  gameBoard = makeBoard(BOARD_SIZE);

  log.info("join", "start", `x=${currentXPlayer.turn} o=${currentOPlayer.turn} turn=${gameTurn}`);

  currentXPlayer.socket.send(encode([VERSION, "START", gameBoard, X, gameTurn] satisfies Schema["Start"]));
  currentOPlayer.socket.send(encode([VERSION, "START", gameBoard, O, gameTurn] satisfies Schema["Start"]));

  log.printBoard(gameBoard, gameTurn);
}

function messageHandleMove(socket: WebSocket, line: number, col: number) {
  const xPlayer = playerGet(X);
  const oPlayer = playerGet(O);

  if (!xPlayer || !oPlayer) {
    log.warn("move", "no_game", "ignoring move: game hasn't started");
    return;
  }

  const player = playerGet(socket);
  if (!player) {
    log.warn("move", "unregistered", "ignoring move: socket not registered");
    return;
  }

  if (player.turn !== gameTurn) {
    log.warn("move", "out_of_turn", `player=${player.turn} turn=${gameTurn}`);
    messageBroadcastSync();
    return;
  }

  gameHandleMove(player, line, col);
}

function playerAdd(socket: WebSocket, wantTurn: Turn | null): Player {
  const wantX = wantTurn === X;
  const wantO = wantTurn === O;
  const xFree = playerGet(X) === null;
  const oFree = playerGet(O) === null;

  let turn: Turn;

  if (wantX && xFree) {
    turn = X;
  } else if (wantO && oFree) {
    turn = O;
  } else if (!wantX && !wantO && xFree) {
    turn = X;
  } else if (!wantX && !wantO && oFree) {
    turn = O;
  } else if (wantX && oFree) {
    turn = O;
  } else if (wantO && xFree) {
    turn = X;
  } else {
    turn = xFree ? X : O;
  }

  const player: Player = { socket, turn };
  playerRegistry.add(player);
  return player;
}

function gameReset(): void {
  log.info("game", "reset", "new game ready");
  gameBoard = makeBoard(BOARD_SIZE);
  gameTurn = null;
}

function gameHandleMove(player: Player, line: number, col: number): void {
  assert(gameBoard !== null);

  const outcome = play(gameBoard, player.turn, { line, col });

  switch (outcome) {
    case Illigal:
      log.warn("move", "illegal", `player=${player.turn} line=${line} col=${col}`);
      break;

    case TurnOver:
      switch (player.turn) {
        case X: gameTurn = O; break;
        case O: gameTurn = X; break;
      }
      messageBroadcastSync();
      log.printBoard(gameBoard, gameTurn);
      break;

    case Tie:
      messageBroadcastOver(Tie);
      log.printBoard(gameBoard, gameTurn);
      log.info("game", "over", "tie");
      break;

    case Win:
      messageBroadcastOver(player.turn);
      log.printBoard(gameBoard, gameTurn);
      log.info("game", "over", `winner=${player.turn}`);
      break;
  }
}

function messageBroadcastSync(): void {
  const xPlayer = playerGet(X);
  const oPlayer = playerGet(O);
  if (!xPlayer || !oPlayer) return;

  xPlayer.socket.send(encode([VERSION, "SYNC", gameBoard!, gameTurn!] satisfies Schema["Sync"]));
  oPlayer.socket.send(encode([VERSION, "SYNC", gameBoard!, gameTurn!] satisfies Schema["Sync"]));
}

function messageBroadcastOver(outcome: Gameover): void {
  const xPlayer = playerGet(X);
  const oPlayer = playerGet(O);
  if (!xPlayer || !oPlayer) return;

  xPlayer.socket.send(encode([VERSION, "OVER", outcome] satisfies Schema["Over"]));
  oPlayer.socket.send(encode([VERSION, "OVER", outcome] satisfies Schema["Over"]));
}
