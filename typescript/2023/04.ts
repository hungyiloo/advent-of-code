import sss from "../lib/parsing.ts";

const parse = sss.array(
  /\r?\n/,
  sss.object(
    /: +| +\| +/,
    'id', sss.array(/ +/, Number).nth(1),
    'winning', sss.array(/ +/, Number),
    'hand', sss.array(/ +/, Number),
    'copies', () => 1
  )
)

const puzzleInput = (await Deno.readTextFile("../../input/2023/04.txt")).trim();
const cards = parse(puzzleInput)

function countWins(card: typeof cards[0]) {
  return card.hand.filter(h => card.winning.includes(h)).length
}

console.log(
  "Part 1:",
  cards.map(card => {
    const wins = countWins(card)
    return wins === 0 ? 0 : Math.pow(2, wins - 1)
  }).reduce((s, x) => s + x)
)

console.log(
  "Part 2:",
  cards.reduce((s, card, index) => {
    const wins = countWins(card)
    for (let ii = 1; ii <= wins; ii++) {
      cards[index + ii].copies += card.copies
    }
    return s + card.copies
  }, 0)
)

