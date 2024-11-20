import sss from "../lib/parsing.ts";

type Color = "red" | "green" | "blue";
function Color(c: string) {
  if (c !== "red" && c !== "green" && c !== "blue") { 
    throw new Error(`${c} is not a valid Color`) 
  }
  return c as Color;
}

const parse = sss.array(
  /\r?\n/, 
  sss.object(
    /: /, 
    'id', sss.array(/ /, Number).nth(1),
    'draws', sss.array(
      /; /,
      sss.array(
        /, /,
        sss.tuple(/ /, Number, Color)
      ).dict(x => x[1], x => x[0])
    )
  )
)

const puzzleInput = (await Deno.readTextFile("../../input/2023/02.txt")).trim();
const games = parse(puzzleInput)

console.log(
  "Part 1:",
  games.reduce(
    (sum, game) =>
      game.draws.every(
        (draw) => (draw.red ?? 0) <= 12 && (draw.green ?? 0) <= 13 && (draw.blue ?? 0) <= 14,
      )
        ? sum + game.id
        : sum,
    0,
  ),
);

console.log(
  "Part 2:",
  games.reduce((sum, game) => {
    const maxDraw = game.draws.reduce(
      (acc, draw) => {
        acc.red = Math.max(draw.red ?? 0, acc.red);
        acc.green = Math.max(draw.green ?? 0, acc.green);
        acc.blue = Math.max(draw.blue ?? 0, acc.blue);
        return acc;
      },
      { red: 0, blue: 0, green: 0 },
    );

    const power = maxDraw.red * maxDraw.green * maxDraw.blue;
    return sum + power;
  }, 0),
);
