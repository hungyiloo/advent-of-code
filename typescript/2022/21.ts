const puzzleInput = (await Deno.readTextFile("../../input/2022/21.txt")).trim();
type Monkey = (want?: number) => number | null;

function solve(part2 = false) {
  let solutionForHumn: number | null = null;

  const monkeys: Map<string, Monkey> = new Map(
    puzzleInput.split('\n').map((line) => {
      const [name, yell] = line.split(": ")
      const n = Number(yell)
      if (isNaN(n)) {
        const [left, operator, right] = yell.split(" ")
        return [
          name,
          combineMonkeys(
            (want?: number) => monkeys.get(left)?.(want)!,
            (want?: number) => monkeys.get(right)?.(want)!,
            operator,
            name === 'root' && part2
          )
        ]
      } else if (name === 'humn' && part2) {
        return [
          name,
          (want?: number) => {
            if (want === undefined) return null;
            solutionForHumn = want;
            return want;
          }
        ]
      } else {
        return [name, () => n]
      }
    })
  );

  function combineMonkeys(
    monkeyLeft: Monkey,
    monkeyRight: Monkey,
    operator: string,
    performEquality = false
  ): Monkey {
    return (want?: number) => {
      const left = monkeyLeft()
      const right = monkeyRight()
      if (performEquality) {
        if (left === null && right !== null) {
          return monkeyLeft(right)
        } else if (left !== null && right === null) {
          return monkeyRight(left)
        } else {
          throw new Error(`Cannot equate ${left} and ${right}`)
        }
      } else if (left !== null && right !== null) {
        switch (operator) {
          case "+": return left + right
          case "-": return left - right
          case "/": return left / right
          case "*": return left * right
          default: throw new Error()
        }
      } else if (want === undefined) {
        return null;
      } else if (left === null && right !== null) {
        switch (operator) {
          case "+": return monkeyLeft(want - right) // want = x + right
          case "-": return monkeyLeft(want + right) // want = x - right
          case "/": return monkeyLeft(want * right) // want = x / right
          case "*": return monkeyLeft(want / right) // want = x * right
          default: throw new Error(`Cannot recognize operator ${operator}`)
        }
      } else if (left !== null && right === null) {
        switch (operator) {
          case "+": return monkeyRight(want - left) // want = left + x
          case "-": return monkeyRight(left - want) // want = left - x
          case "/": return monkeyRight(left / want) // want = left / x
          case "*": return monkeyRight(want / left) // want = left * x
          default: throw new Error(`Cannot recognize operator ${operator}`)
        }
      } else {
        throw new Error(`Cannot resolve ${left} ${operator} ${right} wanting value ${want}`)
      }
    }
  }

  if (part2) {
    monkeys.get('root')?.()
    return solutionForHumn
  } else {
    return monkeys.get('root')?.()
  }
}

console.log("Part 1:", solve())
console.log("Part 2:", solve(true))
