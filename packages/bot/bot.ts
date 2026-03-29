import { Board, Turn, Outcome } from "@game/game";
import { Message, PORT, Schema, VERSION } from "@game/protocol";
import { dbg, printBoard } from "@game/log"
import { decode, encode } from "@std/msgpack";
import { assert } from "@std/assert";

const WS_URL = `ws://localhost:${PORT}`;

export type Bot = {
  socket: WebSocket;
  turn: Turn;
  board: Board;
  currentTurn: Turn;
  // server events
  // handleMsg(this:Bot, msg:Message): void
  // handleDisconnect(this:Bot): void
  // handleErr(this:Bot): void
  // user events
  move(this:Bot, l:number, c:number): void
  close(this:Bot): void
}

export type BotEvents = {
  sync(board:Board, gameTurn: Turn, botTurn: Turn, start:boolean): void
  over(outcome:Outcome): void
}

export function bot(events:Partial<BotEvents>, wantTurn?: Turn, wantFirst?: boolean): Promise<Bot> {
  return new Promise<Bot>((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    let bot: Bot|null = null;

    dbg("init promise", "-", `connecting to ${WS_URL}`);

    ws.onerror = () => {
      dbg("ws", "onerror", "socket connection failed");
      dbg("init promise", "rejecting", "socket connection failed");
      reject(new Error("socket connection failed"));
    };

    ws.onclose = ({reason}) => {
      dbg("ws", "onclose", "socket connection closed");
      dbg("init promise", "rejecting", "socket closed before joining");
      reject(new Error(`socket closed before joining, reason: ${reason}`));
    };

    ws.onopen = () => {
      dbg("ws", "onopen", "ws connected successfully");
      dbg("init promise", "-", "sending a join request");
      ws.send(encode([VERSION, "JOIN", wantTurn??null, wantFirst??false] satisfies Schema["Join"]));
    };

    ws.binaryType = "arraybuffer";
    ws.addEventListener("message", (event) => {

      dbg("ws", "onmsg", "ws recieved a message");

      const bytes = new Uint8Array(event.data);
      const msg = decode(bytes) as Message;
      const [, type] = msg;

      if (type === "WAIT") {
        dbg("msg", `<-${type}`, "");
        dbg("init promise", "-", "won't resolve yet!");
      } else if (type === "START") {
        const [_v, _t, board, turn, currentTurn] = msg;
        dbg("msg", `<-${type}`, `Joined as ${turn}`);
        bot = {
          socket: ws,
          board,
          turn,
          currentTurn,
          move: handleMove,
          close: handleClose,
        };
        
        dbg("ws", "-", "bot started, redirecting close and error events to bot");
        bot.socket.onclose = ({reason}) => { 
          assert(bot)
          handleDisconnect.call(bot, reason);
        };
        bot.socket.onerror = () => {
          assert(bot)
          handleErr.call(bot);
        };

        dbg("init promise", "res", "resolving with bot object", "game started");
        resolve(bot);

        dbg("event signaler", `start|sync`, `notifying consumer: sync(...)`);
        events.sync?.(board, currentTurn, turn, true);
      } else if (bot !== null) {
        handleMsg.call(bot, events, msg);
      }
    });
  });
}


function handleMove( this: Bot, line: number, col: number,) {
  dbg("msg", "move->", `move ${line} ${col}`);
  dbg("ws", "Move->", "-");
  this.socket.send(encode([VERSION, "MOVE", line, col] satisfies Schema["Move"]));
}

function handleDisconnect(this:Bot, reason: string){
  dbg("got disconnected", "-", "-", reason);
}

function handleErr(this:Bot){
  // nothing currently
}

function handleMsg(this:Bot, events: Partial<BotEvents>, msg:Message){
  const [_v, type ] = msg;
  if (type === "SYNC") {
    const [_v, _t, board, currentTurn ] = msg;
    dbg("msg", `<-${type}`, "...");
    this.board = board;
    this.currentTurn = currentTurn;
    dbg("event signaler", `start|sync`, `notifying consumer: sync(...)`);
    events.sync?.(this.board, this.currentTurn, this.turn, false);
  } else if (type === "OVER") {
    const [_v, _t, outcome] = msg;
    dbg("msg", `<-${type}`,
        "Game over",
        outcome === "Tie"
          ? "nobody won"
          : `${outcome} won`);
  } else dbg("msg", "<-?", `unrecognized message type: ${type}`);
}

export function handleClose(this: Bot): void {
  const reason = "user invoked close()"
  dbg("user", "close!", "closing bot's socket", reason)
  dbg("ws", "close!", "closing socket", reason)
  this.socket.close();
}

if (import.meta.main) {
  const stdinReader = Deno.stdin.readable.getReader();
  const decoder = new TextDecoder();

  const xBot = await bot({sync(b,gTurn,bTurn){
    printBoard(b,gTurn);
    console.log(`our turn is: ${bTurn}`);
  }}).catch((e:Error)=>{ console.error(e); Deno.exit(0) });

  while (true) {
    const { value, done } = await stdinReader.read();
    if (done) break;

    const input = decoder.decode(value).trim();
    if (!input) continue;

    if (input === "q" || input === "quit") {
      xBot.close();
      break;
    }

    if (input === "h" || input === "help") {
      console.log(`
                  Commands:
                    <line> <col>  Make a move (e.g., 1 2)
                  q              Quit
                  h              Show this help

                  Board positions:
                    0 | 1 | 2
                  ---------
                    3 | 4 | 5
                  ---------
                    6 | 7 | 8
                  `);
                  continue;
    }

    const parts = input.split(/[\s,]+/);
    if (parts.length === 2) {
      const line = parseInt(parts[0]);
      const col = parseInt(parts[1]);
      if (!isNaN(line) && !isNaN(col)) {
        if (xBot.turn === xBot.currentTurn) {
          xBot.move(line, col);
        } else {
          console.log("Not your turn");
        }
        continue;
      }
    }
    console.log("Invalid input. Enter 'h' for help.");
  }

}
