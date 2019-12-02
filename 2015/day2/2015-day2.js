const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8').split('\n');

const parseDimensions = line => line.split('x').map(d => parseInt(d)).sort((a, b) => a - b);

const calculateWrappingPaper = line => (sortedDimensions => 
  sortedDimensions[0]*sortedDimensions[1]*2 +
  sortedDimensions[1]*sortedDimensions[2]*2 +
  sortedDimensions[0]*sortedDimensions[2]*2 +
  sortedDimensions[0]*sortedDimensions[1]
)(parseDimensions(line))

const calculateRibbonLength = line => (sortedDimensions => 
  (sortedDimensions[0]+sortedDimensions[1])*2 +
  sortedDimensions[0]*sortedDimensions[1]*sortedDimensions[2]
)(parseDimensions(line))

const answer1 = input.map(calculateWrappingPaper).reduce((a, x) => a + x);
console.log('2015 Day 2 Part 1:', answer1);

const answer2 = input.map(calculateRibbonLength).reduce((a, x) => a + x);
console.log('2015 Day 2 Part 2:', answer2);

module.exports = {
  calculateWrappingPaper,
  calculateRibbonLength,
  answer1,
  answer2
}