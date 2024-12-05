import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/05.txt")).trim()
const parse = sss.partition(
  /(?:\r?\n){2}/,
  'rules', sss.array(/\r?\n/, sss.object(/\|/, 'left', Number, 'right', Number)),
  'updates', sss.array(/\r?\n/, sss.array(/,/, Number)),
)
const { rules, updates } = parse(puzzleInput)

const ruleCheckerFor =
  (update: typeof updates[0]) =>
    (rule: typeof rules[0]) => {
      const leftPos = update.indexOf(rule.left)
      const rightPos = update.indexOf(rule.right)
      if (leftPos === -1 || rightPos === -1) {
        return true
      } else {
        return leftPos < rightPos
      }
    }

const correctness = 
  (isCorrect: boolean) => 
    (update: typeof updates[0]) =>
      rules.every(ruleCheckerFor(update)) ? isCorrect : !isCorrect;

const middleOf = (update: typeof updates[0]) => update[Math.floor(update.length / 2)];
const sum = (s: number, x: number) => s + x

console.log(
  "Part 1:",
  updates
    .filter(correctness(true))
    .map(middleOf)
    .reduce(sum)
)

function swap<T>(arr: T[], pos1: number, pos2: number) {
  const temp = arr[pos1]
  arr[pos1] = arr[pos2]
  arr[pos2] = temp
}

function fixUp(update: typeof updates[0]) {
  const getFirstFailingRule = () => rules.find(r => !ruleCheckerFor(update)(r))

  let failingRule = getFirstFailingRule()
  while (failingRule) {
    const leftPos = update.indexOf(failingRule.left)
    const rightPos = update.indexOf(failingRule.right)
    swap(update, leftPos, rightPos)
    failingRule = getFirstFailingRule()
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
