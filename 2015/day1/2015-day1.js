const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

/**
 * Parse parenthesis encoding into +1 and -1 movements
 * @param {string} instructions - the movement instructions in parenthesis encoding
 */
const determineMovements = instructions =>
  instructions.split('').map(char => {
    switch (char) {
      case '(':
        return 1;
      case ')':
        return -1;
      default:
        return 0;
    }
  });

/**
 * Get the entire floor position history for a set of instructions
 * @param {string} instructions - the movement instructions in parenthesis encoding
 */
const getFloorHistory = instructions =>
  determineMovements(instructions).reduce((floorHistory, movement) => {
    const currentFloor =
      floorHistory.length > 0
        ? floorHistory[floorHistory.length - 1] + movement // Last floor history + movement
        : movement; // No floor history? Just record the movement (since we start on floor 0)

    // Accumulate floor history with each movement
    return [...floorHistory, currentFloor];
  }, []);

/**
 * Get the final floor number for a set of instructions
 * @param {string} instructions - the movement instructions in parenthesis encoding
 */
const finalFloor = instructions => getFloorHistory(instructions).pop();

/**
 * Get the instruction number that corresponds to the first time floor becomes negative (i.e. first basement entry),
 * where the instruction number is 1-indexed
 * @param {string} instructions - the movement instructions in parenthesis encoding
 */
const firstBasementEntry = instructions => getFloorHistory(instructions).indexOf(-1) + 1;

const answer1 = finalFloor(input);
console.log('Part 1:', answer1);

const answer2 = firstBasementEntry(input);
console.log('Part 2:', answer2);

module.exports = {
  finalFloor,
  firstBasementEntry,
  answer1,
  answer2
};
