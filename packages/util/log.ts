export enum DebugLevel {
  quiet = 0,
  default = 1,
  info = 2,
  verbose = 3,
}

const DEBUG_LEVEL = DebugLevel.verbose;

function log_structured(who: string, ctx: string, what: string, why?: string) {
  if (why) {
    console.log(`[${who} (${ctx})]: ${why}, ${what}`);
  } else {
    console.log(`[${who} (${ctx})]: ${what}`);
  }
}

type LogArgs = Parameters<typeof log_structured>;

export function dbg(...args: LogArgs) {
  if (DEBUG_LEVEL >= DebugLevel.verbose) log_structured(...args);
}

export function info(...args: LogArgs) {
  if (DEBUG_LEVEL >= DebugLevel.info) log_structured(...args);
}

export function warn(...args: LogArgs) {
  if (DEBUG_LEVEL >= DebugLevel.default) log_structured(...args);
}

export function err(...args: LogArgs) {
  if (DEBUG_LEVEL >= DebugLevel.quiet) log_structured(...args);
}

export function printBoard(board: (string | null)[][], turn: string | null) {
  const symbols = board.map((row) =>
    row.map((cell) => cell ?? ".").join(" ")
  ).join("\n");
  console.log(`\n${symbols}\nTurn: ${turn}`);
}
