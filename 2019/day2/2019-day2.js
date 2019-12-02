const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

/**
 * Functional pipe operator used to compose functions together
 * @param  {...any} fns - functions to compose, applied left to right
 */
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

/**
 * Cartesian product of two arrays
 * @param {any[]} xs - array of values
 * @param {any[]} ys - another array of values
 */
const product = (xs, ys) => [].concat(...xs.map(x => ys.map(y => [].concat(x, y))));

/**
 * Generate an array with values from 0 up to (but not including) the specified size
 * @param {number} size - range to generate
 */
const range = size => Array(size).fill().map((_, i) => i);

/**
 * Parse a tape string into an array of numbers
 * @param {string} tape - a program tape string, formatted as comma-separated integers
 */
const parseTapeToMemory = tape => tape.split(',').map(x => parseInt(x));

/**
 * Replace the noun and verb in program memory, returning the new memory snapshot without mutating initial memory.
 * The noun and the verb addresses are defined by the puzzle conditions in Advent of Code 2019 Day 2 Part 2.
 * @param {number} noun - new value of the noun
 * @param {number} verb - new value of the verb
 */
const replaceMemoryNounAndVerb = (noun, verb) => memory => [memory[0], noun, verb, ...memory.slice(3, memory.length)];

/**
 * Read the program memory and execute instructions until it halts
 * @param {number[]} memory - the memory snapshot to start executing
 */
const executeProgramInMemory = pipe(
  initialMemory => initialMemory.reduce((state, _initialValue, address) => {
    const [halted, operation, x, y, memory] = state;
    const value = memory[address];
    if (halted) {
      return state;
    }

    switch (address % 4) {
      case 0:
        switch (value) {
          case 1: return [halted, (a, b) => a + b, x, y, memory];
          case 2: return [halted, (a, b) => a * b, x, y, memory];
          case 99: return [true, operation, x, y, memory];
          default: throw new Error(`Parsing error! ${value} is not a value operation code`)
        }
      case 1:
        return [halted, operation, memory[value], y, memory];
      case 2:
        return [halted, operation, x, memory[value], memory];
      case 3:
        return [halted, null, null, null, [...memory.slice(0, value), operation(x,y), ...memory.slice(value + 1, memory.length)]]
    }
  }, [false, null, null, null, initialMemory]),
  state => state[4], // Returns the final memory contents of the running program,
);

/**
 * Run the provided tape/program as defined by Advent of Code 2019 Day 2 Part 2  
 * and output value at the beginning of the address space.
 * @param {number} noun - the noun input to the program
 * @param {number} verb - the verb input to the program
 */
const getProgramOutput = (noun, verb) => pipe(
  parseTapeToMemory,
  replaceMemoryNounAndVerb(noun, verb),
  executeProgramInMemory,
  memory => memory[0]
)(input);

// Part 1 asks us for the program output when run with noun=12 and verb=2
const answer1 = getProgramOutput(12, 2);
console.log('2019 Day 2 Part 1:', answer1);

// Part 2 asks us for what noun + verb (possible values [0,99])
// is required for an output of 19690720.
// The answer is also transformed with some basic math (100 * noun + verb).
const answer2 = product(range(100),range(100))
  .map(([noun, verb]) => [noun, verb, getProgramOutput(noun, verb)])
  .filter(([_noun, _verb, programOutput]) => programOutput === 19690720)
  .map(([noun, verb]) => 100 * noun + verb)
  [0];
console.log('2019 Day 2 Part 2:', answer2);

module.exports = {
  executeProgramInMemory,
  product,
  range,
  answer1,
  answer2
}