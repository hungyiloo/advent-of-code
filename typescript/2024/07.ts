import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/07.txt")).trim();

const parse = sss.array(
  /\r?\n/,
  sss.object(
    /\: /,
    'test', Number,
    'values', sss.array(/ /, Number)
  )
)

const equations = parse(puzzleInput)

function search(...ops: ((a: number, b: number) => number)[]) {
  return ({test, values}: typeof equations[0]) => {
    const inner = (values: number[]): boolean => {
      if (values.length >= 2) {
        if (values[0] > test) return false // fail early if we overshoot the test value
        const a = values[0]
        const b = values[1]
        return ops.some(op => inner([op(a, b), ...values.slice(2)]))
      } else {
        return test === values[0]
      }
    }
    return inner(values)
  }
}

console.log(
  "Part 1:",
  equations
    .filter(search(
      (a, b) => a + b,
      (a, b) => a * b
    ))
    .reduce((sum, eq) => sum + eq.test, 0)
);

console.log(
  "Part 2:",
  equations
    .filter(search(
      (a, b) => a + b,
      (a, b) => a * b,
      (a, b) => Number(`${a}${b}`)
    ))
    .reduce((sum, eq) => sum + eq.test, 0)
);
