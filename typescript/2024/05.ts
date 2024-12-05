import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/05.txt")).trim()
const parse = sss.partition(
  /(?:\r?\n){2}/,
  'rules', sss.array(/\r?\n/, sss.array(/\|/, Number)),
  'updates', sss.array(/\r?\n/, sss.array(/,/, Number)),
)
const { rules, updates } = parse(puzzleInput)

function checkRule(update: typeof updates[0]) {
  return (rule: typeof rules[0]) => {
    const left = update.indexOf(rule[0])
    const right = update.indexOf(rule[1])
    if (left === -1 || right === -1) {
      return true
    } else {
      return left < right
    }
  }
}

const correctness = 
  (isCorrect: boolean) => 
    (update: typeof updates[0]) =>
      rules.every(checkRule(update)) ? isCorrect : !isCorrect;

const middleOf = (update: typeof updates[0]) => update[Math.floor(update.length / 2)];
const sum = (s: number, x: number) => s + x

console.log(
  "Part 1:",
  updates
    .filter(correctness(true))
    .map(middleOf)
    .reduce(sum)
)

function swap<T>(arr: T[], x: number, y: number) {
  const temp = arr[x]
  arr[x] = arr[y]
  arr[y] = temp
}

function fixUp(update: typeof updates[0]) {
  const getFirstFailingRule = () => rules.find(r => !checkRule(update)(r))

  let failure = getFirstFailingRule()
  while (failure) {
    const left = update.indexOf(failure[0])
    const right = update.indexOf(failure[1])
    swap(update, left, right)
    failure = getFirstFailingRule()
  }

  return update // a bit redundant, since we mutated the update array anyway
}

console.log(
  "Part 2:",
  updates
    .filter(correctness(false))
    .map(fixUp)
    .map(middleOf)
    .reduce(sum)
)
