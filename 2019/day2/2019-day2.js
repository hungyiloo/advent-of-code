const fs = require('fs');
const path = require('path');
const inputTape = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

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
const readTapeToMemory = tape => tape.split(',').map(x => parseInt(x));

/**
 * Replaces a value in memory at the specified address
 * @param {number} address - the address/position to write the new value to
 * @param {number} newValue - the new value to write at the address
 */
const replaceValueInMemory = (address, newValue) => memory => [...memory.slice(0, address), newValue, ...memory.slice(address + 1, memory.length)];

/**
 * Read the program memory and execute instructions until it halts
 * @param {number[]} memory - the memory snapshot to start executing
 */
const executeProgramInMemory = pipe(
  initialMemory => initialMemory.reduce(
    (state, _initialValue, address) => {
      const { halted, memory, operation, x, y } = state;
      const value = memory[address];
      if (halted) {
        return state;
      }

      switch (address % 4) {
        case 0:
          switch (value) {
            case 1: return { ...state, operation: (a, b) => a + b };
            case 2: return { ...state, operation: (a, b) => a * b };
            case 99: return { ...state, halted: true };
            default: throw new Error(`Parsing error! ${value} is not a value operation code`)
          }
        case 1:
          return { ...state, x: memory[value] };
        case 2:
          return { ...state, y: memory[value] };
        case 3:
          return { ...state, memory: replaceValueInMemory(value, operation(x,y))(memory) }
      }
    }, 
    { halted: false, operation: null, x: null, y: null, memory: initialMemory }
  ),
  state => state.memory
);

/**
 * Run the provided tape/program as defined by Advent of Code 2019 Day 2 Part 2  
 * and, after halting, output value at the beginning of the address space.
 * @param {number} noun - the noun input to the program
 * @param {number} verb - the verb input to the program
 */
const getProgramOutput = (noun, verb) => pipe(
  readTapeToMemory,
  replaceValueInMemory(1, noun),
  replaceValueInMemory(2, verb),
  executeProgramInMemory,
  memory => memory[0]
)(inputTape);

// Part 1 asks us for the program output when run with noun=12 and verb=2
const answer1 = getProgramOutput(12, 2);
console.log('2019 Day 2 Part 1:', answer1);

// Part 2 asks us for what noun + verb (possible values [0,99])
// is required for an output of 19690720.
// The answer is also transformed with some basic math (100 * noun + verb).
const answer2 = pipe(
  searchSpace => searchSpace.find(([noun, verb]) => getProgramOutput(noun, verb) === 19690720),
  ([noun, verb]) => 100 * noun + verb
)(product(range(100),range(100)));
console.log('2019 Day 2 Part 2:', answer2);

module.exports = {
  executeProgramInMemory,
  product,
  range,
  answer1,
  answer2
}