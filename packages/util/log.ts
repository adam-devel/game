const STYLES = {
  dbg: "color: blue",
  info: "",
  warn: "color: orange",
  err: "color: red",
};

let needsLeadingNewline = false;

function printCtx(label: string, msg: string, ctx: string[] | Record<string, unknown> | [unknown], style: string) {
  console.log(`%c\n${label}%c ${msg}`, style, STYLES.info);
  needsLeadingNewline = true;

  if (!Array.isArray(ctx)) {
    const keys = Object.keys(ctx);
    for (const key of keys) {
      console.log(`  - ${key} = ${(ctx as Record<string, unknown>)[key]}`);
    }
    return;
  }

  if (ctx.length === 1) {
    const val = ctx[0];
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      const keys = Object.keys(val);
      if (keys.length === 1) {
        console.log(`  - ${keys[0]} = ${(val as Record<string, unknown>)[keys[0]]}`);
        return;
      }
    }
    console.log(val);
    return;
  }

  for (const item of ctx) {
    console.log(`  - ${item}`);
  }
}

function logFn(msg: string, ctx?: string[] | Record<string, unknown> | [unknown], label = "", style = "") {
  if (!ctx) {
    if (needsLeadingNewline) {
      console.log(`%c\n${label}%c ${msg}`, style, STYLES.info);
      needsLeadingNewline = false;
    } else {
      console.log(`%c${label}%c ${msg}`, style, STYLES.info);
    }
    return;
  }

  printCtx(label, msg, ctx, style);
}

export function log(msg: string, ctx?: string[] | Record<string, unknown> | [unknown]) {
  logFn(msg, ctx);
}

export function dbg(msg: string, ctx?: string[] | Record<string, unknown> | [unknown]) {
  logFn(msg, ctx, "DBUG", STYLES.dbg);
}

export function info(msg: string, ctx?: string[] | Record<string, unknown> | [unknown]) {
  logFn(msg, ctx, "INFO", STYLES.info);
}

export function warn(msg: string, ctx?: string[] | Record<string, unknown> | [unknown]) {
  logFn(msg, ctx, "WARN", STYLES.warn);
}

export function err(msg: string, ctx?: string[] | Record<string, unknown> | [unknown]) {
  logFn(msg, ctx, "ERR ", STYLES.err);
}

export { printBoard } from "./fmt.ts";
