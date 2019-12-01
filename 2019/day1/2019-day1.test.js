const { calculateRequiredFuel, sumReducer, answer1, answer2 } = require('./2019-day1');

test('day 1 part 1 examples', () => {
  expect(calculateRequiredFuel(12)).toBe(2);
  expect(calculateRequiredFuel(14)).toBe(2);
  expect(calculateRequiredFuel(1969)).toBe(654);
  expect(calculateRequiredFuel(100756)).toBe(33583);
});

test('day 1 part 1 answer', () => {
  expect(answer1).toBe(3471229);
})

test('day 1 part 2 examples', () => {
  expect(calculateRequiredFuel(14, true)).toBe(2);
  expect(calculateRequiredFuel(1969, true)).toBe(966);
  expect(calculateRequiredFuel(100756, true)).toBe(50346);
});

test('day 1 part 2 answer', () => {
  expect(answer2).toBe(5203967);
})

test('reducing X,Y,Z with sumReducer equals X+Y+Z', () => {
  expect([1,2,3].reduce(sumReducer)).toBe(6);
  expect([0,3,5].reduce(sumReducer)).toBe(8);
  expect([0,0,1].reduce(sumReducer)).toBe(1);
});

test('reducing just X with sumReducer equals X', () => {
  expect([7].reduce(sumReducer)).toBe(7);
  expect([0].reduce(sumReducer)).toBe(0);
});

const day1Compact = require('./2019-day1.compact');

test('day 1 part 1 code golf answer', () => {
  expect(day1Compact.answer1).toBe(3471229);
})

test('day 1 part 2 code golf answer', () => {
  expect(day1Compact.answer2).toBe(5203967);
})