// deno:https://jsr.io/@std/msgpack/1.0.3/decode.ts
function decode(data) {
  const pointer = {
    consumed: 0
  };
  const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const value = decodeSlice(data, dataView, pointer);
  if (pointer.consumed < data.length) {
    throw new EvalError("Messagepack decode did not consume whole array");
  }
  return value;
}
function decodeString(uint8, size, pointer) {
  pointer.consumed += size;
  const u8 = uint8.subarray(pointer.consumed - size, pointer.consumed);
  if (u8.length !== size) {
    throw new EvalError("Messagepack decode reached end of array prematurely");
  }
  return decoder.decode(u8);
}
function decodeArray(uint8, dataView, size, pointer) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    const value = decodeSlice(uint8, dataView, pointer);
    arr.push(value);
  }
  return arr;
}
function decodeMap(uint8, dataView, size, pointer) {
  const map = {};
  for (let i = 0; i < size; i++) {
    const key = decodeSlice(uint8, dataView, pointer);
    const value = decodeSlice(uint8, dataView, pointer);
    if (typeof key !== "number" && typeof key !== "string") {
      throw new EvalError("Cannot decode a key of a map: The type of key is invalid, keys must be a number or a string");
    }
    map[key] = value;
  }
  return map;
}
var decoder = new TextDecoder();
var FIXMAP_BITS = 128;
var FIXMAP_MASK = 240;
var FIXARRAY_BITS = 144;
var FIXARRAY_MASK = 240;
var FIXSTR_BITS = 160;
var FIXSTR_MASK = 224;
function decodeSlice(uint8, dataView, pointer) {
  if (pointer.consumed >= uint8.length) {
    throw new EvalError("Messagepack decode reached end of array prematurely");
  }
  const type = dataView.getUint8(pointer.consumed);
  pointer.consumed++;
  if (type <= 127) {
    return type;
  }
  if ((type & FIXMAP_MASK) === FIXMAP_BITS) {
    const size = type & ~FIXMAP_MASK;
    return decodeMap(uint8, dataView, size, pointer);
  }
  if ((type & FIXARRAY_MASK) === FIXARRAY_BITS) {
    const size = type & ~FIXARRAY_MASK;
    return decodeArray(uint8, dataView, size, pointer);
  }
  if ((type & FIXSTR_MASK) === FIXSTR_BITS) {
    const size = type & ~FIXSTR_MASK;
    return decodeString(uint8, size, pointer);
  }
  if (type >= 224) {
    return type - 256;
  }
  switch (type) {
    case 192:
      return null;
    case 193:
      throw new Error("Messagepack decode encountered a type that is never used");
    case 194:
      return false;
    case 195:
      return true;
    case 196: {
      if (pointer.consumed >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint8(pointer.consumed);
      pointer.consumed++;
      const u8 = uint8.subarray(pointer.consumed, pointer.consumed + length);
      if (u8.length !== length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      pointer.consumed += length;
      return u8;
    }
    case 197: {
      if (pointer.consumed + 1 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint16(pointer.consumed);
      pointer.consumed += 2;
      const u8 = uint8.subarray(pointer.consumed, pointer.consumed + length);
      if (u8.length !== length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      pointer.consumed += length;
      return u8;
    }
    case 198: {
      if (pointer.consumed + 3 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint32(pointer.consumed);
      pointer.consumed += 4;
      const u8 = uint8.subarray(pointer.consumed, pointer.consumed + length);
      if (u8.length !== length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      pointer.consumed += length;
      return u8;
    }
    case 199:
    case 200:
    case 201:
      throw new Error("Cannot decode a slice: Large extension type 'ext' not implemented yet");
    case 202: {
      if (pointer.consumed + 3 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getFloat32(pointer.consumed);
      pointer.consumed += 4;
      return value;
    }
    case 203: {
      if (pointer.consumed + 7 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getFloat64(pointer.consumed);
      pointer.consumed += 8;
      return value;
    }
    case 204: {
      if (pointer.consumed >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getUint8(pointer.consumed);
      pointer.consumed += 1;
      return value;
    }
    case 205: {
      if (pointer.consumed + 1 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getUint16(pointer.consumed);
      pointer.consumed += 2;
      return value;
    }
    case 206: {
      if (pointer.consumed + 3 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getUint32(pointer.consumed);
      pointer.consumed += 4;
      return value;
    }
    case 207: {
      if (pointer.consumed + 7 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getBigUint64(pointer.consumed);
      pointer.consumed += 8;
      return value;
    }
    case 208: {
      if (pointer.consumed >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getInt8(pointer.consumed);
      pointer.consumed += 1;
      return value;
    }
    case 209: {
      if (pointer.consumed + 1 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getInt16(pointer.consumed);
      pointer.consumed += 2;
      return value;
    }
    case 210: {
      if (pointer.consumed + 3 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getInt32(pointer.consumed);
      pointer.consumed += 4;
      return value;
    }
    case 211: {
      if (pointer.consumed + 7 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const value = dataView.getBigInt64(pointer.consumed);
      pointer.consumed += 8;
      return value;
    }
    case 212:
    case 213:
    case 214:
    case 215:
    case 216:
      throw new Error("Cannot decode a slice: 'fixext' not implemented yet");
    case 217: {
      if (pointer.consumed >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint8(pointer.consumed);
      pointer.consumed += 1;
      return decodeString(uint8, length, pointer);
    }
    case 218: {
      if (pointer.consumed + 1 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint16(pointer.consumed);
      pointer.consumed += 2;
      return decodeString(uint8, length, pointer);
    }
    case 219: {
      if (pointer.consumed + 3 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint32(pointer.consumed);
      pointer.consumed += 4;
      return decodeString(uint8, length, pointer);
    }
    case 220: {
      if (pointer.consumed + 1 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint16(pointer.consumed);
      pointer.consumed += 2;
      return decodeArray(uint8, dataView, length, pointer);
    }
    case 221: {
      if (pointer.consumed + 3 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint32(pointer.consumed);
      pointer.consumed += 4;
      return decodeArray(uint8, dataView, length, pointer);
    }
    case 222: {
      if (pointer.consumed + 1 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint16(pointer.consumed);
      pointer.consumed += 2;
      return decodeMap(uint8, dataView, length, pointer);
    }
    case 223: {
      if (pointer.consumed + 3 >= uint8.length) {
        throw new EvalError("Messagepack decode reached end of array prematurely");
      }
      const length = dataView.getUint32(pointer.consumed);
      pointer.consumed += 4;
      return decodeMap(uint8, dataView, length, pointer);
    }
  }
  throw new Error("Unreachable");
}

// deno:https://jsr.io/@std/bytes/1.0.6/concat.ts
function concat(buffers) {
  let length = 0;
  for (const buffer of buffers) {
    length += buffer.length;
  }
  const output = new Uint8Array(length);
  let index = 0;
  for (const buffer of buffers) {
    output.set(buffer, index);
    index += buffer.length;
  }
  return output;
}

// deno:https://jsr.io/@std/msgpack/1.0.3/encode.ts
var FOUR_BITS = 16;
var FIVE_BITS = 32;
var SEVEN_BITS = 128;
var EIGHT_BITS = 256;
var FIFTEEN_BITS = 32768;
var SIXTEEN_BITS = 65536;
var THIRTY_ONE_BITS = 2147483648;
var THIRTY_TWO_BITS = 4294967296;
var SIXTY_THREE_BITS = 9223372036854775808n;
var SIXTY_FOUR_BITS = 18446744073709551616n;
var encoder = new TextEncoder();
function encode(object) {
  const byteParts = [];
  encodeSlice(object, byteParts);
  return concat(byteParts);
}
function encodeFloat64(num) {
  const dataView = new DataView(new ArrayBuffer(9));
  dataView.setFloat64(1, num);
  dataView.setUint8(0, 203);
  return new Uint8Array(dataView.buffer);
}
function encodeNumber(num) {
  if (!Number.isInteger(num)) {
    return encodeFloat64(num);
  }
  if (num < 0) {
    if (num >= -FIVE_BITS) {
      return new Uint8Array([
        num
      ]);
    }
    if (num >= -SEVEN_BITS) {
      return new Uint8Array([
        208,
        num
      ]);
    }
    if (num >= -FIFTEEN_BITS) {
      const dataView = new DataView(new ArrayBuffer(3));
      dataView.setInt16(1, num);
      dataView.setUint8(0, 209);
      return new Uint8Array(dataView.buffer);
    }
    if (num >= -THIRTY_ONE_BITS) {
      const dataView = new DataView(new ArrayBuffer(5));
      dataView.setInt32(1, num);
      dataView.setUint8(0, 210);
      return new Uint8Array(dataView.buffer);
    }
    return encodeFloat64(num);
  }
  if (num <= 127) {
    return new Uint8Array([
      num
    ]);
  }
  if (num < EIGHT_BITS) {
    return new Uint8Array([
      204,
      num
    ]);
  }
  if (num < SIXTEEN_BITS) {
    const dataView = new DataView(new ArrayBuffer(3));
    dataView.setUint16(1, num);
    dataView.setUint8(0, 205);
    return new Uint8Array(dataView.buffer);
  }
  if (num < THIRTY_TWO_BITS) {
    const dataView = new DataView(new ArrayBuffer(5));
    dataView.setUint32(1, num);
    dataView.setUint8(0, 206);
    return new Uint8Array(dataView.buffer);
  }
  return encodeFloat64(num);
}
function encodeSlice(object, byteParts) {
  if (object === null) {
    byteParts.push(new Uint8Array([
      192
    ]));
    return;
  }
  if (object === false) {
    byteParts.push(new Uint8Array([
      194
    ]));
    return;
  }
  if (object === true) {
    byteParts.push(new Uint8Array([
      195
    ]));
    return;
  }
  if (typeof object === "number") {
    byteParts.push(encodeNumber(object));
    return;
  }
  if (typeof object === "bigint") {
    if (object < 0) {
      if (object < -SIXTY_THREE_BITS) {
        throw new Error("Cannot safely encode bigint larger than 64 bits");
      }
      const dataView2 = new DataView(new ArrayBuffer(9));
      dataView2.setBigInt64(1, object);
      dataView2.setUint8(0, 211);
      byteParts.push(new Uint8Array(dataView2.buffer));
      return;
    }
    if (object >= SIXTY_FOUR_BITS) {
      throw new Error("Cannot safely encode bigint larger than 64 bits");
    }
    const dataView = new DataView(new ArrayBuffer(9));
    dataView.setBigUint64(1, object);
    dataView.setUint8(0, 207);
    byteParts.push(new Uint8Array(dataView.buffer));
    return;
  }
  if (typeof object === "string") {
    const encoded = encoder.encode(object);
    const len = encoded.length;
    if (len < FIVE_BITS) {
      byteParts.push(new Uint8Array([
        160 | len
      ]));
    } else if (len < EIGHT_BITS) {
      byteParts.push(new Uint8Array([
        217,
        len
      ]));
    } else if (len < SIXTEEN_BITS) {
      const dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint16(1, len);
      dataView.setUint8(0, 218);
      byteParts.push(new Uint8Array(dataView.buffer));
    } else if (len < THIRTY_TWO_BITS) {
      const dataView = new DataView(new ArrayBuffer(5));
      dataView.setUint32(1, len);
      dataView.setUint8(0, 219);
      byteParts.push(new Uint8Array(dataView.buffer));
    } else {
      throw new Error("Cannot safely encode string with size larger than 32 bits");
    }
    byteParts.push(encoded);
    return;
  }
  if (object instanceof Uint8Array) {
    if (object.length < EIGHT_BITS) {
      byteParts.push(new Uint8Array([
        196,
        object.length
      ]));
    } else if (object.length < SIXTEEN_BITS) {
      const dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint16(1, object.length);
      dataView.setUint8(0, 197);
      byteParts.push(new Uint8Array(dataView.buffer));
    } else if (object.length < THIRTY_TWO_BITS) {
      const dataView = new DataView(new ArrayBuffer(5));
      dataView.setUint32(1, object.length);
      dataView.setUint8(0, 198);
      byteParts.push(new Uint8Array(dataView.buffer));
    } else {
      throw new Error("Cannot safely encode Uint8Array with size larger than 32 bits");
    }
    byteParts.push(object);
    return;
  }
  if (Array.isArray(object)) {
    if (object.length < FOUR_BITS) {
      byteParts.push(new Uint8Array([
        144 | object.length
      ]));
    } else if (object.length < SIXTEEN_BITS) {
      const dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint16(1, object.length);
      dataView.setUint8(0, 220);
      byteParts.push(new Uint8Array(dataView.buffer));
    } else if (object.length < THIRTY_TWO_BITS) {
      const dataView = new DataView(new ArrayBuffer(5));
      dataView.setUint32(1, object.length);
      dataView.setUint8(0, 221);
      byteParts.push(new Uint8Array(dataView.buffer));
    } else {
      throw new Error("Cannot safely encode array with size larger than 32 bits");
    }
    for (const obj of object) {
      encodeSlice(obj, byteParts);
    }
    return;
  }
  const prototype = Object.getPrototypeOf(object);
  if (prototype === null || prototype === Object.prototype) {
    const numKeys = Object.keys(object).length;
    if (numKeys < FOUR_BITS) {
      byteParts.push(new Uint8Array([
        128 | numKeys
      ]));
    } else if (numKeys < SIXTEEN_BITS) {
      const dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint16(1, numKeys);
      dataView.setUint8(0, 222);
      byteParts.push(new Uint8Array(dataView.buffer));
    } else if (numKeys < THIRTY_TWO_BITS) {
      const dataView = new DataView(new ArrayBuffer(5));
      dataView.setUint32(1, numKeys);
      dataView.setUint8(0, 223);
      byteParts.push(new Uint8Array(dataView.buffer));
    } else {
      throw new Error("Cannot safely encode map with size larger than 32 bits");
    }
    for (const [key, value] of Object.entries(object)) {
      encodeSlice(key, byteParts);
      encodeSlice(value, byteParts);
    }
    return;
  }
  throw new Error("Cannot safely encode value into messagepack");
}

// client.ts
var WS_URL = `ws://localhost:3000`;
var VERSION = "1.0.0";
var CELL_SIZE = 80;
var BOARD_SIZE = 3;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = BOARD_SIZE * CELL_SIZE;
canvas.height = BOARD_SIZE * CELL_SIZE;
var state = "disconnected";
var board = null;
var myTurn = null;
var currentTurn = null;
var outcome = null;
var ws = null;
function makeBoard(n) {
  const b = [];
  for (let l = 0; l < n; l++) {
    b[l] = [];
    for (let c = 0; c < n; c++) {
      b[l][c] = null;
    }
  }
  return b;
}
function play(b, t, line, col) {
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
function connect() {
  ws = new WebSocket(WS_URL);
  ws.binaryType = "arraybuffer";
  ws.onopen = () => {
    log("Connected, joining game...");
    ws.send(encode([
      VERSION,
      "JOIN",
      null,
      false
    ]));
  };
  ws.onclose = () => {
    state = "disconnected";
    log("Disconnected");
    updateUI();
  };
  ws.onerror = () => log("Connection error");
  ws.onmessage = (event) => {
    const msg = decode(new Uint8Array(event.data));
    const [, type, ...args] = msg;
    handleMessage(type, args);
  };
}
function handleMessage(type, args) {
  switch (type) {
    case "WAIT":
      state = "waiting";
      board = makeBoard(BOARD_SIZE);
      log("Waiting for opponent...");
      break;
    case "START": {
      const [boardArg, myTurnArg, currentTurnArg] = args;
      board = boardArg;
      myTurn = myTurnArg;
      currentTurn = currentTurnArg;
      state = "playing";
      log(`Game started! You are ${myTurn}`);
      break;
    }
    case "SYNC": {
      const [boardArg, currentTurnArg] = args;
      board = boardArg;
      currentTurn = currentTurnArg;
      log("Board synced");
      break;
    }
    case "OVER": {
      const [outcomeArg] = args;
      outcome = outcomeArg;
      state = "over";
      log(`Game over: ${outcome}`);
      break;
    }
  }
  updateUI();
}
function makeMove(line, col) {
  if (state !== "playing" || !board || currentTurn !== myTurn) return;
  if (board[line][col] !== null) return;
  const result = play(board, myTurn, line, col);
  if (result === "Illigal") return;
  if (result === "TurnOver") {
    currentTurn = myTurn === "X" ? "O" : "X";
  }
  ws.send(encode([
    VERSION,
    "MOVE",
    line,
    col
  ]));
  log(`Move: ${line},${col}`);
  updateUI();
}
function getCell(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  return {
    line: Math.floor(y / CELL_SIZE),
    col: Math.floor(x / CELL_SIZE)
  };
}
function log(msg) {
  const el = document.getElementById("log");
  if (el) el.textContent = msg;
}
function updateUI() {
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
function drawBoard() {
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
function restart() {
  state = "disconnected";
  board = null;
  myTurn = null;
  currentTurn = null;
  outcome = null;
  connect();
}
canvas.addEventListener("click", (e) => {
  if (state !== "playing" || currentTurn !== myTurn) return;
  const { line, col } = getCell(e);
  if (line >= 0 && line < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    makeMove(line, col);
  }
});
globalThis.connect = connect;
globalThis.restart = restart;
connect();
