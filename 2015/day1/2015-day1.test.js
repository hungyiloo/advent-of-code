const { finalFloor, firstBasementEntry, answer1, answer2 } = require('./2015-day1')

test('2015 day 1 part 1 examples', () => {
  expect(finalFloor('(())')).toBe(0);
  expect(finalFloor('()()')).toBe(0);
  expect(finalFloor('(((')).toBe(3);
  expect(finalFloor('(()(()(')).toBe(3);
  expect(finalFloor('))(((((')).toBe(3);
  expect(finalFloor('())')).toBe(-1);
  expect(finalFloor('))(')).toBe(-1);
  expect(finalFloor(')))')).toBe(-3);
  expect(finalFloor(')())())')).toBe(-3);
});

test('2015 day 1 part 1 answer', () => {
  expect(answer1).toBe(138);
})

test('2015 day 1 part 2 examples', () => {
  expect(firstBasementEntry(')')).toBe(1);
  expect(firstBasementEntry('()())')).toBe(5);
});

test('2015 day 1 part 2 answer', () => {
  expect(answer2).toBe(1771);
})