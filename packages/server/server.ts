import {
  Board,
  Gameover,
  Illigal,
  make_board as makeBoard,
  O,
  play,
  Tie,
  Turn,
  TurnOver,
  Win,
  X,
} from "@game/game";
import { Message, PORT, Schema, VERSION } from "@game/protocol";
import * as log from "@game/log";
import { decode, encode } from "@std/msgpack";
import { assert } from "@std/assert";

const BOARD_SIZE = 3;

let gameBoard: Board | null = null;
let gameTurn: Turn | null;

type Player = { socket: WebSocket; turn: Turn };

const playerRegistry = new Set<Player>();

function playerGet(part: WebSocket | Turn): Player | null {
  const players = [...playerRegistry.keys()];
  const result = players.find((p) => p.socket === part || p.turn === part);
  return result ?? null;
}

server();
export function server() {
  return new Promise((res) => {
    Deno.serve(
      {
        port: PORT,
        onListen: (a) => {
          serverOnListen(a);
          res(null);
        },
      },
      (request) => {
        log.dbg("http request received");
        if (request.headers.get("upgrade") !== "websocket") {
          log.info("only websocket connections accepted: responding with 426");
          return new Response(null, { status: 426, headers: { "Upgrade": "websocket" } });
        }

        const { socket, response } = Deno.upgradeWebSocket(request);
        socket.binaryType = "arraybuffer";

        socket.addEventListener("open", () => {
          log.dbg("websocket connection established");
        })

        socket.addEventListener("close", () => {
          log.dbg("client disconnected");
          socketHandleClose(socket)
        });

        socket.addEventListener(
          "message",
          ({ data }) => {
            log.dbg("message received");
            socketHandleMessage(socket, new Uint8Array(data as ArrayBuffer))
          }
        );

        log.dbg("upgrading connection to websocket");
        return response;
      },
    );
  });
}

function serverOnListen({ hostname, port }: Deno.NetAddr) {
  log.info(`listening on ws://${hostname}:${port}`);
}

function socketHandleClose(socket: WebSocket) {
  const player = playerGet(socket);
  if (!player) {
    log.dbg("ignoring unregistered client");
    return;
  }

  const opponent = playerGet(player.turn === X ? O : X);
  if (opponent) {
    log.info("player disconnected: disconnecting opponent");
    opponent.socket.close(1000, "Opponent Disconnected");
  } else {
    log.dbg("player disconnected, no opponent left");
  }

  log.dbg("clearing player registry");
  playerRegistry.clear();

  log.dbg("resetting game state");
  gameReset();
}

function socketHandleMessage(socket: WebSocket, data: Uint8Array) {
  if (socket.binaryType !== "arraybuffer") {
    log.warn("ignoring non-arraybuffer message");
    return;
  }

  const msg = decode(new Uint8Array(data)) as Message;
  const [version, ...body] = msg;

  if (version !== VERSION) {
    log.warn("message version mismatch: disconnecting client");
    socket.close(1000, "Version Mismatch");
    return;
  }

  const [type] = body;
  log.dbg(`received message "${type}"`);

  if (type === "JOIN") {
    const [, wantTurn, wantFirst] = body;
    messageHandleJoin(socket, wantTurn, wantFirst);
  } else if (type === "MOVE") {
    const [, line, col] = body;
    messageHandleMove(socket, line, col);
  } else {
    log.warn("unknown message type");
  }
}

function messageHandleJoin(
  socket: WebSocket,
  wantTurn: Turn | null,
  wantFirst: boolean,
) {
  const xPlayer = playerGet(X);
  const oPlayer = playerGet(O);

  if (xPlayer && oPlayer) {
    log.info("refusing join request: game full");
    socket.close(1000, "Game full");
    return;
  }

  const player = playerAdd(socket, wantTurn);

  if (gameTurn === null && wantFirst) {
    gameTurn = player.turn;
  }

  const currentXPlayer = playerGet(X);
  const currentOPlayer = playerGet(O);

  if (!currentXPlayer || !currentOPlayer) {
    log.dbg("sent WAIT");
    socket.send(encode([VERSION, "WAIT"] satisfies Schema["Wait"]));
    return;
  }

  gameTurn = gameTurn ?? X;
  gameBoard = makeBoard(BOARD_SIZE);

  log.info("game starting");

  log.dbg("sent START to X");
  currentXPlayer.socket.send(
    encode(
      [VERSION, "START", gameBoard, X, gameTurn] satisfies Schema["Start"],
    ),
  );
  log.dbg("sent START to O");
  currentOPlayer.socket.send(
    encode(
      [VERSION, "START", gameBoard, O, gameTurn] satisfies Schema["Start"],
    ),
  );

  log.printBoard(gameBoard, gameTurn);
}

function messageHandleMove(socket: WebSocket, line: number, col: number) {
  const xPlayer = playerGet(X);
  const oPlayer = playerGet(O);

  if (!xPlayer || !oPlayer) {
    log.warn(`ignoring move: game hasn't started`);
    return;
  }

  const player = playerGet(socket);
  if (!player) {
    log.warn(`ignoring move: socket not registered`);
    return;
  }

  if (player.turn !== gameTurn) {
    log.warn(`ignoring move: out of turn`);
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
  log.dbg(`player joined: ${turn}`);
  return player;
}

function gameReset(): void {
  log.info("new game ready");
  gameBoard = makeBoard(BOARD_SIZE);
  gameTurn = null;
}

function gameHandleMove(player: Player, line: number, col: number): void {
  assert(gameBoard !== null);

  const outcome = play(gameBoard, player.turn, { line, col });

  switch (outcome) {
    case Illigal:
      log.warn(`illegal move: ${line},${col}`);
      messageBroadcastSync();
      break;

    case TurnOver:
      switch (player.turn) {
        case X:
          gameTurn = O;
          break;
        case O:
          gameTurn = X;
          break;
      }
      messageBroadcastSync();
      log.printBoard(gameBoard, gameTurn);
      break;

    case Tie:
      messageBroadcastSync();
      messageBroadcastOver(Tie);
      log.printBoard(gameBoard, gameTurn);
      log.info("game tied");
      break;

    case Win:
      messageBroadcastSync();
      messageBroadcastOver(player.turn);
      log.printBoard(gameBoard, gameTurn);
      log.info(`game over: ${player.turn} wins`);
      break;
  }
}

function messageBroadcastSync(): void {
  const xPlayer = playerGet(X);
  const oPlayer = playerGet(O);
  if (!xPlayer || !oPlayer) return;

  log.dbg("sent SYNC");
  xPlayer.socket.send(
    encode([VERSION, "SYNC", gameBoard!, gameTurn!] satisfies Schema["Sync"]),
  );
  log.dbg("sent SYNC");
  oPlayer.socket.send(
    encode([VERSION, "SYNC", gameBoard!, gameTurn!] satisfies Schema["Sync"]),
  );
}

function messageBroadcastOver(outcome: Gameover): void {
  const xPlayer = playerGet(X);
  const oPlayer = playerGet(O);
  if (!xPlayer || !oPlayer) return;

  log.info("sent OVER");
  xPlayer.socket.send(
    encode([VERSION, "OVER", outcome] satisfies Schema["Over"]),
  );
  log.info("sent OVER");
  oPlayer.socket.send(
    encode([VERSION, "OVER", outcome] satisfies Schema["Over"]),
  );
}
