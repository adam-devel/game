export function printBoard(board: (string | null)[][], turn: string | null) {
  const cell = (val: string | null) => " " + (val ?? " ") + " ";
  
  const top = "┌───┬───┬───┐";
  const mid = "├───┼───┼───┤";
  const bot = "└───┴───┴───┘";

  const rows = board.map((row) => {
    return `│${cell(row[0])}│${cell(row[1])}│${cell(row[2])}│`;
  });

  console.log(`\n${top}\n${rows[0]}\n${mid}\n${rows[1]}\n${mid}\n${rows[2]}\n${bot}\nTurn: ${turn} `);
}
