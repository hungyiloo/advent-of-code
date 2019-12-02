const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

/**
 * Functional pipe operator used to compose functions together
 * @param  {...any} fns - functions to compose, applied left to right
 */
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const tap = fn => x => { fn(x); return x; }

const parseTape = tape => tape.split(',').map(x => parseInt(x));

const execute = pipe(
  initialMemory => initialMemory.reduce((state, _value, address) => {
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
  state => state[4], // Returns the final state of the program,
);

const answer1 = pipe(
  parseTape,
  inputMemory => [inputMemory[0], 12, 2, ...inputMemory.slice(3, inputMemory.length)],
  execute,
  outputMemory => outputMemory[0]
)(input);
console.log(answer1);

const answer2 = []

module.exports = {
  execute,
  answer1,
  answer2
}