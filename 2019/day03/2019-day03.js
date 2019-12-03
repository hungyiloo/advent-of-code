const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8').split('\n');

/**
 * Generate an array with values from 0 up to (but not including) the specified size
 * @param {number} size - range to generate
 */
const range = size => Array(size).fill().map((_, i) => i);

const increment = x => x + 1;

const tracePath = directions => directions
  .split(',')
  .reduce((path, movement) => {
    const [direction, ...distanceChars] = movement.split('');
    const distance = parseInt(distanceChars.join(''));
    const [lastX, lastY] = path[path.length - 1];
    switch(direction) {
      case 'R': return [...path, ...range(distance).map(increment).map(delta => [lastX + delta, lastY])];
      case 'L': return [...path, ...range(distance).map(increment).map(delta => [lastX - delta, lastY])];
      case 'U': return [...path, ...range(distance).map(increment).map(delta => [lastX, lastY + delta])];
      case 'D': return [...path, ...range(distance).map(increment).map(delta => [lastX, lastY - delta])];
    }
  }, [[0,0]])

const getCoordinateSet = path => path.reduce((s, point) => s.add(JSON.stringify(point)), new Set());

const intersection = (set1, set2) => Array.from(set1.values())
  .reduce((result, curr) => set2.has(curr) ? result.concat(curr) : result, []);

const findCrossingPoints = (path1, path2) => intersection(
  getCoordinateSet(path1),
  getCoordinateSet(path2)
).map(pointJson => JSON.parse(pointJson));

const manhattanDistanceFromOrigin = (...paths) => point => Math.abs(point[0]) + Math.abs(point[1]);

const timingDistance = (...paths) => 
  point => paths
    .map(path => path.findIndex(p => p[0] === point[0] && p[1] === point[1]))
    .reduce((a, b) => a + b);

const shortestCrossingPointDistance = (distanceMeasure, directions1, directions2) => {
  const path1 = tracePath(directions1);
  const path2 = tracePath(directions2);
  return findCrossingPoints(path1, path2)
    .map(distanceMeasure(path1, path2))
    .sort((a, b) => a - b)
    [1]; // Ignore the origin
}

const answer1 = shortestCrossingPointDistance(manhattanDistanceFromOrigin, input[0], input[1]);
console.log('2019 Day 3 Part 1:', answer1);

const answer2 = shortestCrossingPointDistance(timingDistance, input[0], input[1]);
console.log('2019 Day 3 Part 2:', answer2);

module.exports = {
  shortestCrossingPointDistance,
  manhattanDistanceFromOrigin,
  timingDistance,
  answer1,
  answer2
}