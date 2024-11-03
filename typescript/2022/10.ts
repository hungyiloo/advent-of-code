const puzzleInput = (await Deno.readTextFile("../../input/2022/10.txt")).trim();

const instructions = puzzleInput.split(/\r?\n/)
  .map(line => line.split(' '))
  .map(([cmd, arg]) => ({cmd, arg: parseInt(arg)}));

let part1 = 0     // signal strength sum
let part2 = '\n'; // CRT screen output
let x = 1;        // X register value
let cycles = 0;   // clock/cycles/ticks

for (const { cmd, arg } of instructions) {
  // Switch on the cmd to figure out how long
  // the instruction will run
  let duration = cmd === 'addx' ? 2 : 1;

  // The inner loop simulates the instruction
  // for its given number of cycles, and handles the
  // cycle updating logic + answer accumulation
  while (duration > 0) {
    // Construct the sprite by drawing lit pixels
    // at the X position and 1 pixel either side
    const sprite = Array(40).fill(0)
      .map((_, i) => [x-1,x,x+1].includes(i) ? '▓' : '░')

    // Render the correct part of the sprite
    // depending on the previous cycle
    part2 += sprite[cycles % 40];

    // Increment the cycle count
    cycles++;

    // In the middle of each line of 40 cycles,
    // calculate signal strength and accumulate
    if ((cycles - 20) % 40 === 0 && cycles <= 220)
      part1 += x * cycles;

    // After each line of 40 cycles,
    // switch to a new line on the CRT output
    if (cycles % 40 === 0)
      part2 += '\n';

    duration--;
  }
  // Updating the X value always occurs at the
  // end of the duration of the 'addx' instruction
  if (cmd === 'addx' && !!arg)
    x += arg;
}

console.log("Part 1:", part1);
console.log("Part 2:", part2);
