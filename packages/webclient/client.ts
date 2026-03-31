import * as msgpack from "@std/msgpack";

const WS_URL = `ws://localhost:3000`;
const VERSION = "1.0.0";
const CELL_SIZE = 80;
const BOARD_SIZE = 3;

type Cell = "X" | "O" | null;
type Board = Cell[][];
type GameState = "disconnected" | "waiting" | "playing" | "over";
type MoveResult = "Win" | "Tie" | "TurnOver" | "Illigal";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
canvas.width = BOARD_SIZE * CELL_SIZE;
canvas.height = BOARD_SIZE * CELL_SIZE;

let state: GameState = "disconnected";
let board: Board | null = null;
let myTurn: Cell = null;
let currentTurn: Cell = null;
let outcome: string | null = null;
let ws: WebSocket | null = null;

function makeBoard(n: number): Board {
  const b: Board = [];
  for (let l = 0; l < n; l++) {
    b[l] = [];
    for (let c = 0; c < n; c++) {
      b[l][c] = null;
    }
  }
  return b;
}

function play(b: Board, t: Cell, line: number, col: number): MoveResult {
  if (line < 0 || line >= b.length) return "Illigal";
  if (col < 0 || col >= b[line].length) return "Illigal";
  if (b[line][col] !== null) return "Illigal";

  b[line][col] = t;

  if (b[line].every((cell) => cell === t)) return "Win";
  if (b.every((l) => l[col] === t)) return "Win";
  if (b.every((row, i) => row[i] === t)) return "Win";
  if (b.every((row, i) => row[b.length - i - 1] === t)) return "Win";

  if (!b.some((l) => l.some((c) => c === null))) return "Tie";

  return "TurnOver";
}

function connect(): void {
  ws = new WebSocket(WS_URL);

  ws.binaryType = "arraybuffer";
  ws.onopen = () => {
    log("Connected, joining game...");
    ws!.send(msgpack.encode([VERSION, "JOIN", null, false]));
  };

  ws.onclose = () => {
    state = "disconnected";
    log("Disconnected");
    updateUI();
  };

  ws.onerror = () => log("Connection error");

  ws.onmessage = (event: MessageEvent) => {
    const msg = msgpack.decode(new Uint8Array(event.data)) as unknown[];
    const [, type, ...args] = msg;
    handleMessage(type as string, args);
  };
}

function handleMessage(type: string, args: unknown[]): void {
  switch (type) {
    case "WAIT":
      state = "waiting";
      board = makeBoard(BOARD_SIZE);
      log("Waiting for opponent...");
      break;

    case "START": {
      const [boardArg, myTurnArg, currentTurnArg] = args;
      board = boardArg as Board;
      myTurn = myTurnArg as Cell;
      currentTurn = currentTurnArg as Cell;
      state = "playing";
      log(`Game started! You are ${myTurn}`);
      break;
    }

    case "SYNC": {
      const [boardArg, currentTurnArg] = args;
      board = boardArg as Board;
      currentTurn = currentTurnArg as Cell;
      log("Board synced");
      break;
    }

    case "OVER": {
      const [outcomeArg] = args;
      outcome = outcomeArg as string;
      state = "over";
      log(`Game over: ${outcome}`);
      break;
    }
  }
  updateUI();
}

function makeMove(line: number, col: number): void {
  if (state !== "playing" || !board || currentTurn !== myTurn) return;
  if (board[line][col] !== null) return;

  const result = play(board, myTurn, line, col);
  if (result === "Illigal") return;

  if (result === "TurnOver") {
    currentTurn = myTurn === "X" ? "O" : "X";
  }

  ws!.send(msgpack.encode([VERSION, "MOVE", line, col]));
  log(`Move: ${line},${col}`);
  updateUI();
}

function getCell(e: MouseEvent): { line: number; col: number } {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return {
    line: Math.floor(y / CELL_SIZE),
    col: Math.floor(x / CELL_SIZE),
  };
}

function log(msg: string): void {
  const el = document.getElementById("log");
  if (el) el.textContent = msg;
}

function updateUI(): void {
  const statusEl = document.getElementById("status");
  const restartEl = document.getElementById("restart");
  if (!statusEl || !restartEl) return;

  if (state === "disconnected") {
    statusEl.textContent = "Disconnected";
    restartEl.style.display = "none";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  if (state === "waiting") {
    statusEl.textContent = "Waiting for opponent...";
    restartEl.style.display = "none";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  if (state === "over") {
    const winner = outcome === "Tie" ? "Tie!" : `${outcome} wins!`;
    statusEl.textContent = winner;
    restartEl.style.display = "block";
    drawBoard();
    return;
  }

  const isMyTurn = currentTurn === myTurn;
  statusEl.textContent = isMyTurn ? "Your turn!" : "Opponent's turn...";
  restartEl.style.display = "none";
  drawBoard();
}

function drawBoard(): void {
  ctx.fillStyle = "#16213e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 4;
  for (let i = 1; i < BOARD_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CELL_SIZE, 0);
    ctx.lineTo(i * CELL_SIZE, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL_SIZE);
    ctx.lineTo(canvas.width, i * CELL_SIZE);
    ctx.stroke();
  }

  if (!board) return;

  ctx.font = `${CELL_SIZE * 0.7}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const cell = board[i][j];
      if (cell) {
        ctx.fillStyle = cell === "X" ? "#e94560" : "#0f3460";
        ctx.fillText(cell, j * CELL_SIZE + CELL_SIZE / 2, i * CELL_SIZE + CELL_SIZE / 2);
      }
    }
  }
}

function restart(): void {
  state = "disconnected";
  board = null;
  myTurn = null;
  currentTurn = null;
  outcome = null;
  connect();
}

canvas.addEventListener("click", (e: MouseEvent) => {
  if (state !== "playing" || currentTurn !== myTurn) return;
  const { line, col } = getCell(e);
  if (line >= 0 && line < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    makeMove(line, col);
  }
});

(globalThis as { connect?: typeof connect; restart?: typeof restart }).connect = connect;
(globalThis as { connect?: typeof connect; restart?: typeof restart }).restart = restart;
connect();