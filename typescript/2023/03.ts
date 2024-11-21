
const puzzleInput = (await Deno.readTextFile("../../input/2023/03.txt")).trim();
const schematic = puzzleInput.split(/\r?\n/)
const rows = schematic.length

type Element = {
  content: string,
  row: number,
  col: number,
}

function findElements(pattern: RegExp) {
  const elements: Element[] = []
  for (let row = 0; row < rows; row++) {
    const matches = schematic[row].matchAll(pattern)
    for (const match of matches) {
      elements.push({
        content: match[0],
        row,
        col: match.index,
      })
    }
  }
  return elements
}

function adjacent(e1: Element, e2: Element) {
  if (Math.abs(e1.row - e2.row) > 1) return false

  const left1 = e1.col
  const right1 = e1.col + e1.content.length - 1
  const left2 = e2.col
  const right2 = e2.col + e2.content.length - 1
  if ((left2 - right1 > 1) || (left1 - right2 > 1)) return false

  return true
}

const parts = findElements(/\d+/g)
const symbols = findElements(/[^\d\.]/g)
console.log(
  "Part 1:",
  parts.reduce((sum, part) => {
    if (symbols.some(symbol => adjacent(part, symbol))) {
      return sum + Number(part.content)
    } else {
      return sum
    }
  }, 0)
)

const gears = findElements(/\*/g)
console.log(
  "Part 2:",
  gears.reduce((sum, gear) => {
    const adjacentParts = parts.filter(p => adjacent(p, gear))
    if (adjacentParts.length === 2) {
      return sum + Number(adjacentParts[0].content) * Number(adjacentParts[1].content)
    } else {
      return sum
    }
  }, 0)
)
