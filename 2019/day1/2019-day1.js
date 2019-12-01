// Load the list of numbers (i.e. masses)
const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8')
  .split('\n')
  .map(s => parseInt(s));

/**
 * Calculates the required fuel for any given mass
 * @param {number} mass - the mass for which to calculate required fuel
 * @param {boolean} [recurse=false] - whether to calculate the fuel recursively (i.e. fuel required for the fuel required for the fuel...)
 */
function calculateRequiredFuel(mass, recurse = false) {
  const fuel = Math.floor(mass / 3) - 2;
  if (!recurse) {
    // Part 1
    return fuel;
  } else {
    // Part 2
    return fuel > 0 ? fuel + calculateRequiredFuel(fuel, recurse) : 0;
  }
}

// A reducer to sum up a list of numbers
const sumReducer = (sum, curr) => sum + curr;

// Part 1 answer
const answer1 = input.map(mass => calculateRequiredFuel(mass)).reduce(sumReducer);
console.log('Answer 1:', answer1);

// Part 2 answer
const answer2 = input.map(mass => calculateRequiredFuel(mass, true)).reduce(sumReducer);
console.log('Answer 2:', answer2);

// Export key components for testing
module.exports = {
  calculateRequiredFuel,
  sumReducer,
  answer1,
  answer2
};