const {
  shortestCrossingPointDistance,
  manhattanDistanceFromOrigin,
  combinedStepsDistance,
  answer1,
  answer2
} = require('./2019-day03');

test('2019 day 3 part 1 examples', () => {
  expect(
    shortestCrossingPointDistance(
      manhattanDistanceFromOrigin, 
      'R8,U5,L5,D3', 
      'U7,R6,D4,L4'
    )).toBe(6);
  expect(
    shortestCrossingPointDistance(
      manhattanDistanceFromOrigin,
      'R75,D30,R83,U83,L12,D49,R71,U7,L72',
      'U62,R66,U55,R34,D71,R55,D58,R83'
    )
  ).toBe(159);
  expect(
    shortestCrossingPointDistance(
      manhattanDistanceFromOrigin,
      'R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51',
      'U98,R91,D20,R16,D67,R40,U7,R15,U6,R7'
    )
  ).toBe(135);
});

test('2019 day 3 part 1 answer', () => {
  expect(answer1).toBe(293);
});

test('2019 day 3 part 2 examples', () => {
  expect(
    shortestCrossingPointDistance(
      combinedStepsDistance, 
      'R8,U5,L5,D3', 
      'U7,R6,D4,L4'
    )).toBe(30);
  expect(
    shortestCrossingPointDistance(
      combinedStepsDistance,
      'R75,D30,R83,U83,L12,D49,R71,U7,L72',
      'U62,R66,U55,R34,D71,R55,D58,R83'
    )
  ).toBe(610);
  expect(
    shortestCrossingPointDistance(
      combinedStepsDistance,
      'R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51',
      'U98,R91,D20,R16,D67,R40,U7,R15,U6,R7'
    )
  ).toBe(410);
});

test('2019 day 3 part 2 answer', () => {
  expect(answer2).toBe(27306);
});