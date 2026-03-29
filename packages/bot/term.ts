import { printBoard } from "@game/log";
import { bot as createBot } from "@game/bot";

const stdinReader = Deno.stdin.readable.getReader();
const decoder = new TextDecoder();

const bot = await createBot({
  sync(b, gTurn, bTurn) {
    printBoard(b, gTurn);
    console.log(`our turn is: ${bTurn}`);
  },
}).catch((e: Error) => {
  console.error(e);
  Deno.exit(0);
});

while (true) {
  const { value, done } = await stdinReader.read();
  if (done) break;

  const input = decoder.decode(value).trim();
  if (!input) continue;

  if (input === "q" || input === "quit") {
    bot.close();
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
      if (bot.turn === bot.currentTurn) {
        bot.move(line, col);
      } else {
        console.log("Not your turn");
      }
      continue;
    }
  }
  console.log("Invalid input. Enter 'h' for help.");
}
