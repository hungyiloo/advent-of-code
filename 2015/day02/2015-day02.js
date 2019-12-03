const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8').split('\n');

/**
 * Functional pipe operator used to compose functions together
 * @param  {...any} fns - functions to compose, applied left to right
 */
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

/**
 * Parses dimensions from a string into a tuple [A,B,C]
 * @param {string} line - dimensions in AxBxC format
 */
const parseDimensions = line =>
  line
    .split('x')
    .map(d => parseInt(d))
    .sort((a, b) => a - b);

/**
 * Calculates the wrapping paper area required for a present of dimensions AxBxC
 * @param {string} line - dimensions in AxBxC format
 */
const calculateWrappingPaper = pipe(
  parseDimensions,
  dimensions =>
    dimensions[0] * dimensions[1] * 2 +
    dimensions[1] * dimensions[2] * 2 +
    dimensions[0] * dimensions[2] * 2 +
    dimensions[0] * dimensions[1]
);

/**
 * Calculates the ribbon length required for a present of dimensions AxBxC
 * @param {string} line - dimensions in AxBxC format
 */
const calculateRibbonLength = pipe(
  parseDimensions,
  dimensions => (dimensions[0] + dimensions[1]) * 2 + dimensions[0] * dimensions[1] * dimensions[2]
);

const answer1 = input.map(calculateWrappingPaper).reduce((a, x) => a + x);
console.log('2015 Day 2 Part 1:', answer1);

const answer2 = input.map(calculateRibbonLength).reduce((a, x) => a + x);
console.log('2015 Day 2 Part 2:', answer2);

module.exports = {
  calculateWrappingPaper,
  calculateRibbonLength,
  answer1,
  answer2
};
