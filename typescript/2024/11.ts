import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/11.txt")).trim();
const parse = sss.array(/ /, Number)
const stones = new Map(parse(puzzleInput).map(s => [s, 1]))

function blink(stones: Map<number, number>) {
  const result = new Map<number, number>()

  function track(stone: number, count: number) {
    return result.set(stone, (result.get(stone) ?? 0) + count)
  }

  for (const [stone, count] of stones.entries()) {
    if (stone === 0) {
      track(1, count)
    } else if (String(stone).length % 2 === 0) {
      const stoneStr = String(stone)
      const halfway = stoneStr.length / 2
      track(Number(stoneStr.slice(0, halfway)), count)
      track(Number(stoneStr.slice(halfway)), count)
      continue
    } else {
      track(stone*2024, count)
    }
  }

  return result
}

function repeat<T>(n: number, fn: (x: T) => T): (x: T) => T {
  return x => {
    for (let ii = 0; ii < n; ii++) x = fn(x)
    return x
  }
}

console.log("Part 1:", repeat(25, blink)(stones).values().reduce((s, x) => s + x))
console.log("Part 2:", repeat(75, blink)(stones).values().reduce((s, x) => s + x))
