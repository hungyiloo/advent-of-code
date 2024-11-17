const puzzleInput = (await Deno.readTextFile("../../input/2023/02.txt")).trim();
const lines = puzzleInput.split(/\r?\n/);

type Color = "red" | "green" | "blue";
type Draw = Record<Color, number>;
type Game = { id: number; draws: Draw[] };

const games: Game[] = lines.map((line) => {
  const [_, id, content] = line.split(/Game |: /);
  const sets = content.split("; ");
  const draws = sets.map((set) =>
    set.split(", ").reduce(
      (acc, curr) => {
        const [number, color] = curr.split(" ");
        acc[color as Color] = Number(number);
        return acc;
      },
      { red: 0, blue: 0, green: 0 },
    ),
  );
  return { id: Number(id), draws };
});

console.log(
  "Part 1:",
  games.reduce(
    (sum, game) =>
      game.draws.every(
        (draw) => draw.red <= 12 && draw.green <= 13 && draw.blue <= 14,
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
        acc.red = Math.max(draw.red, acc.red);
        acc.green = Math.max(draw.green, acc.green);
        acc.blue = Math.max(draw.blue, acc.blue);
        return acc;
      },
      { red: 0, blue: 0, green: 0 },
    );

    const power = maxDraw.red * maxDraw.green * maxDraw.blue;
    return sum + power;
  }, 0),
);
