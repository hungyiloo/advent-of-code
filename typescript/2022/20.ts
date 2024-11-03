const puzzleInput = (await Deno.readTextFile("../../input/2022/20.txt")).trim();

function parse(input: string, multiplier: number) {
  return input.split(/\r?\n/).map((n) => ({ n: Number(n) * multiplier }));
}

function mix(repeats = 1, decryptionKey = 1) {
  const nums = parse(puzzleInput, decryptionKey);
  const queue = [...nums];
  for (let ii = 0; ii < repeats; ii++) {
    for (const item of queue) {
      const index = nums.indexOf(item);
      nums.splice(index, 1);
      const destination = (index + item.n + nums.length) % nums.length;
      nums.splice(destination, 0, item);
    }
  }

  const zeroPosition = nums.findIndex(({ n }) => n === 0);
  const a = nums[(zeroPosition + 1000) % nums.length].n;
  const b = nums[(zeroPosition + 2000) % nums.length].n;
  const c = nums[(zeroPosition + 3000) % nums.length].n;

  return a + b + c;
}

const part1 = mix();
console.log("Part 1:", part1);

const part2 = mix(10, 811589153);
console.log("Part 2:", part2);
