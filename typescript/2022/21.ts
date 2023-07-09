const puzzleInput = (await Deno.readTextFile("../../input/2022/21.txt")).trim();
type Computer = (want?: number) => Promise<number | null>;

async function solve(part2 = false) {
  let humanAnswer: number | null = null;

  const monkeys: Map<string, Computer> = new Map(
    puzzleInput.split('\n').map((line) => {
      const [name, yell] = line.split(": ")
      const n = Number(yell)
      if (isNaN(n)) {
        const [left, operator, right] = yell.split(" ")
        const a = (w?: number) => monkeys.get(left)?.(w)!
        const b = (w?: number) => monkeys.get(right)?.(w)!
        return [
          name,
          compute(a, b, operator, name === 'root' && part2)
        ]
      } else if (name === 'humn' && part2) {
        return [name, (want?: number) => new Promise(resolve => {
          if (want) {
            humanAnswer = want;
            resolve(want);
          } else {
            resolve(null)
          }
        })]
      } else {
        return [name, () => new Promise(resolve => resolve(n))] as const
      }
    })
  );

  function compute(a: Computer, b: Computer, operator: string, isRoot = false): Computer {
    return (want?: number) => Promise.all([a(), b()]).then(([left, right]) => {
      if (isRoot) {
        if (left === null && right !== null) {
          return a(right)
        } else if (left !== null && right === null) {
          return b(left)
        } else {
          throw new Error(`Cannot equate ${left} and ${right}`)
        }
      } else {
        if (left !== null && right !== null) {
          switch (operator) {
            case "+": return left + right
            case "-": return left - right
            case "/": return left / right
            case "*": return left * right
            default: throw new Error()
          }
        } else if (left === null && right !== null) {
          switch (operator) {
            case "+": return !want ? null : a(want - right) // want = x + right
            case "-": return !want ? null : a(want + right) // want = x - right
            case "/": return !want ? null : a(want * right) // want = x / right
            case "*": return !want ? null : a(want / right) // want = x * right
            default: throw new Error()
          }
        } else if (left !== null && right === null) {
          switch (operator) {
            case "+": return !want ? null : b(want - left) // want = left + x
            case "-": return !want ? null : b(left - want) // want = left - x
            case "/": return !want ? null : b(left / want) // want = left / x
            case "*": return !want ? null : b(want / left) // want = left * x
            default: throw new Error()
          }
        } else {
          throw new Error(`Cannot resolve ${left} ${operator} ${right}`)
        }
      }
    })
  }

  if (part2) {
    await monkeys.get('root')?.()
    return humanAnswer
  } else {
    return await monkeys.get('root')?.()
  }
}

console.log("Part 1:", await solve())
console.log("Part 2:", await solve(true))
