const fuel = m => (m / 3 >> 0) - 2;
const recursiveFuel = m => (f => f > 0 ? f + recursiveFuel(f) : 0)(fuel(m));
const [answer1, answer2] = require('fs')
  .readFileSync(require('path').join(__dirname, 'input.txt'), 'utf8')
  .split('\n')
  .map(s => parseInt(s))
  .reduce(([answer1, answer2], m) => [answer1 + fuel(m), answer2 + recursiveFuel(m)], [0,0]);

module.exports = { answer1, answer2 };