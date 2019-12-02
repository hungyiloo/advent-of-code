const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

/**
 * Functional pipe operator used to compose functions together
 * @param  {...any} fns - functions to compose, applied left to right
 */
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const product = (xs, ys) => [].concat(...xs.map(x => ys.map(y => [].concat(x, y))));
const range = size => Array(size).fill().map((_, i) => i);
const parseTapeToMemory = tape => tape.split(',').map(x => parseInt(x));
const replaceMemoryNounAndVerb = (noun, verb) => memory => [memory[0], noun, verb, ...memory.slice(3, memory.length)];
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

const getProgramOutput = (noun, verb) => pipe(
  parseTapeToMemory,
  replaceMemoryNounAndVerb(noun, verb),
  executeProgramInMemory,
  memory => memory[0]
)(input);

const answer1 = getProgramOutput(12, 2);
console.log('2019 Day 2 Part 1:', answer1);

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