const fs = require('fs');
const path = require('path');
const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8').split('\n');

/**
 * Functional pipe operator used to compose functions together
 * @param  {...any} fns - functions to compose, applied left to right
 */
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

/**
 * Generate an array with values from 0 up to (but not including) the specified size
 * @param {number} size - range to generate
 */
const range = size => Array(size).fill().map((_, i) => i);

/**
 * Increment the given number
 * @param {number} x 
 */
const increment = x => x + 1;

/**
 * Get the destination coordinate after moving in the specified direction and distance from a known point
 * @param {string} direction - the direction to move toward
 * @param {[number, number]} fromPoint - the point to move from
 * @param {number} distance - the number of steps to take 
 */

/**
 * Get the destination coordinate after moving in the specified direction and distance from a known point
 * @param {string} direction - the direction to move toward
 * @param {[number, number]} fromPoint - the point to move from
 * @returns {moveWithDirectionFromPoint} a function to move in a direction from a point for a given distance
 */
const move = (direction, [fromX, fromY]) => distance => {
  switch (direction) {
    case 'R': return [fromX + distance, fromY];
    case 'L': return [fromX - distance, fromY];
    case 'U': return [fromX, fromY + distance];
    case 'D': return [fromX, fromY - distance];
  }
};

/**
 * @callback moveWithDirectionFromPoint
 * @param {string} direction - the direction to move toward
 * @param {[number, number]} fromPoint - the point to move from
 * @param {number} distance - the number of steps to take 
 */

/**
 * Trace a path and output all of its coordinates, step by step
 * @param {string} directions - comma separated instructions in the puzzle format, e.g. U7,R6,D4,L4...
 */
const tracePath = directions =>
  directions.split(',').reduce(
    (path, vector) => {
      const [direction, ...distanceChars] = vector.split('');
      const distance = parseInt(distanceChars.join(''));
      const lastPosition = path[path.length - 1];
      return path.concat(
        range(distance)
          .map(increment)
          .map(move(direction, lastPosition))
      );
    },
    [[0, 0]]
  );

/**
 * Return a set of all coordinates in a path (unique by their JSON representation)
 * @param {[number,number][]} path 
 */
const getCoordinateSet = path => path.reduce((s, point) => s.add(JSON.stringify(point)), new Set());

/**
 * Find the intersection between two sets
 * @param {Set} set1 
 * @param {Set} set2 
 */
const binaryIntersection = (set1, set2) =>
  Array.from(set1.values()).reduce((result, curr) => (set2.has(curr) ? result.add(curr) : result), new Set());

/**
 * Find the intersection of all given sets
 * @param  {...Set} sets - sets to intersect
 */
const intersection = (...sets) => sets.reduce((result, currSet) => binaryIntersection(result, currSet));

/**
 * Find all coordinates where the given paths intersect
 * @param  {...[number,number]} paths
 */
const findCrossingPoints = (...paths) =>
  pipe(
    paths => paths.map(getCoordinateSet),
    pathCoordinateSets => intersection(...pathCoordinateSets),
    commonCoordinatesSet => Array.from(commonCoordinatesSet.values()),
    commonCoordinateJsonValues => commonCoordinateJsonValues.map(c => JSON.parse(c))
  )(paths);

/**
 * Find the Manhattan Distance from the origin for a given coordinate
 * @param  {...[number,number]} paths
 * @param  {[number,number]} coordinate
 */
const manhattanDistanceFromOrigin = (...paths) => ([x, y]) => Math.abs(x) + Math.abs(y);

/**
 * For a given point, find the total number of steps for all given paths to get to that point
 * @param  {...[number,number]} paths
 * @param  {[number,number]} coordinate
 */
const combinedStepsDistance = (...paths) => ([x, y]) =>
  paths
    .map(path => path.findIndex(([pathX, pathY]) => pathX === x && pathY === y))
    .filter(distance => distance !== -1)
    .reduce((a, b) => a + b);

/**
 * Find the closest crossing point for all given paths, measured by the given distance measure function
 * @param  {distanceMeasure} distanceMeasure 
 * @param  {...string} directions 
 */
const shortestCrossingPointDistance = (distanceMeasure, ...directions) =>
  pipe(
    directions => directions.map(tracePath),
    paths => findCrossingPoints(...paths).map(distanceMeasure(...paths)),
    crossingPointDistances => crossingPointDistances.reduce((min, d) => d !== 0 && d < min ? d : min, Infinity),
  )(directions);

/**
 * @callback distanceMeasure
 * @param  {...[number,number]} paths
 * @param  {[number,number]} coordinate
 */

const answer1 = shortestCrossingPointDistance(manhattanDistanceFromOrigin, ...input);
console.log('2019 Day 3 Part 1:', answer1);

const answer2 = shortestCrossingPointDistance(combinedStepsDistance, ...input);
console.log('2019 Day 3 Part 2:', answer2);

module.exports = {
  shortestCrossingPointDistance,
  manhattanDistanceFromOrigin,
  combinedStepsDistance,
  answer1,
  answer2
};
