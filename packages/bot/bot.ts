import { Board, Outcome, Turn } from "@game/game";
import { Message, PORT, Schema, VERSION } from "@game/protocol";
import * as log from "@game/log";
import { decode, encode } from "@std/msgpack";
import { assert } from "@std/assert";

const WS_URL = `ws://localhost:${PORT}`;

export type Bot = {
  socket: WebSocket;
  turn: Turn;
  board: Board;
  currentTurn: Turn;
  move(this: Bot, l: number, c: number): void;
  close(this: Bot): void;
};

export type BotEvents = {
  sync(board: Board, gameTurn: Turn, botTurn: Turn, start: boolean): void;
  over(outcome: Outcome): void;
};

export function bot(
  events: Partial<BotEvents>,
  wantTurn?: Turn,
  wantFirst?: boolean,
): Promise<Bot> {
  return new Promise<Bot>((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    let bot: Bot | null = null;

    log.dbg(`connecting to ${WS_URL}`);

    ws.onerror = () => {
      log.warn("socket error (ws:onerror)");
      log.warn("rejecting socket connection");
      reject(new Error("socket connection failed"));
    };

    ws.onclose = ({ reason }) => {
      log.dbg("socket closed (ws:onclose)");
      log.warn(`rejecting socket connection: ${reason}`);
      reject(new Error(`socket closed before joining, reason: ${reason}`));
    };

    ws.onopen = () => {
      log.dbg("socket open (ws:onopen)");
      log.dbg("sending join request");
      ws.send(
        encode(
          [
            VERSION,
            "JOIN",
            wantTurn ?? null,
            wantFirst ?? false,
          ] satisfies Schema["Join"],
        ),
      );
      log.dbg("sent JOIN");
    };

    ws.binaryType = "arraybuffer";
    ws.addEventListener("message", (event) => {
      const bytes = new Uint8Array(event.data);
      const msg = decode(bytes) as Message;
      const [, type] = msg;

      log.dbg("received message (ws:onmessage)");

      if (type === "WAIT") {
        log.dbg("received WAIT");
        log.dbg("waiting for opponent");
      } else if (type === "START") {
        const [_v, _t, board, turn, currentTurn] = msg;
        log.dbg("received START");
        bot = {
          socket: ws,
          board,
          turn,
          currentTurn,
          move: handleMove,
          close: handleClose,
        };

        log.dbg("redirecting event handlers to bot");
        bot.socket.onclose = ({ reason }) => {
          assert(bot);
          handleDisconnect.call(bot, reason);
        };
        bot.socket.onerror = () => {
          assert(bot);
          handleErr.call(bot);
        };

        log.dbg("resolving promise");
        resolve(bot);

        log.dbg("emitting sync event");
        events.sync?.(board, currentTurn, turn, true);
      } else if (bot !== null) {
        handleMsg.call(bot, events, msg);
      }
    });
  });
}

function handleMove(this: Bot, line: number, col: number) {
  log.dbg(`sending move to server: ${line},${col}`);
  this.socket.send(
    encode([VERSION, "MOVE", line, col] satisfies Schema["Move"]),
  );
}

function handleDisconnect(this: Bot, reason: string) {
  log.dbg(`socket disconnected: ${reason}`);
}

function handleErr(this: Bot) {
  log.warn("socket error (ws:error)");
}

function handleMsg(this: Bot, events: Partial<BotEvents>, msg: Message) {
  const [_v, type] = msg;
  if (type === "SYNC") {
    const [_v, _t, board, currentTurn] = msg;
    log.dbg("received SYNC");
    this.board = board;
    this.currentTurn = currentTurn;
    log.dbg("emitting sync event");
    events.sync?.(this.board, this.currentTurn, this.turn, false);
  } else if (type === "OVER") {
    const [_v, _t, outcome] = msg;
    log.dbg(`received OVER: ${outcome}`);
  } else log.warn("unrecognized message type");
}

export function handleClose(this: Bot): void {
  log.dbg("closing socket");
  this.socket.close();
}
