const puzzleInput = (await Deno.readTextFile("../../input/2022/20.txt")).trim();

function parse(input: string) {
  return input.split("\n").map(n => ({ n: Number(n), moved: false }));
}

const nums = parse(puzzleInput);

let moves = 0;
let index = 0;
// console.log(nums.map(({ n }, i) => i === index ? `[${n}]` : n).join(', '))
while (moves < nums.length) {
  const { n, moved } = nums[index]
  if (!moved) {
    // console.log(nums.map(({ n }, i) => i === index ? `[${n}]` : n).join(', '))
    nums.splice(index, 1)
    const target = (index + n + nums.length) % nums.length
    // console.log(`Moving ${n} to position ${target}`)
    nums.splice(target, 0, { n, moved: true })
    moves++;
    // console.log(nums.map(({ n }) => n).join(', '))
  } else {
    index = (index + 1) % nums.length;
    // console.log(nums.map(({ n }, i) => i === index ? `[${n}]` : n).join(', '))
  }
  // console.log('\n')
}
// console.log(nums.map(({ n }, i) => i === index ? `[${n}]` : n).join(', '))

const zeroPosition = nums.findIndex(({ n }) => n === 0)
const a = nums[(zeroPosition + 1000) % nums.length].n
const b = nums[(zeroPosition + 2000) % nums.length].n
const c = nums[(zeroPosition + 3000) % nums.length].n
const part1 = a + b + c;
console.log("Part 1:", part1);

const part2 = 0;
console.log("Part 2:", part2);
