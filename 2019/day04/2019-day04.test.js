const { rangeFrom, isValid, isStrictlyValid, answer1, answer2 } = require('./2019-day04');

test('2019 day 4 part 1 examples', () => {
  expect(isValid(111111)).toBe(true);
  expect(isValid(223450)).toBe(false);
  expect(isValid(123789)).toBe(false);
});

test('2019 day 4 range from/to', () => {
  expect(rangeFrom(0,3)).toStrictEqual([0,1,2]);
  expect(rangeFrom(1,4)).toStrictEqual([1,2,3]);
  expect(rangeFrom(1,1)).toStrictEqual([]);
  expect(rangeFrom(0,1)).toStrictEqual([0]);
  expect(rangeFrom(1,2)).toStrictEqual([1]);
});

test('2019 day 4 part 1 answer', () => {
  expect(answer1).toBe(2150);
});

test('2019 day 4 part 2 examples', () => {
  expect(isStrictlyValid(111111)).toBe(false);
  expect(isStrictlyValid(223450)).toBe(false);
  expect(isStrictlyValid(123789)).toBe(false);
  expect(isStrictlyValid(112233)).toBe(true);
  expect(isStrictlyValid(123444)).toBe(false);
  expect(isStrictlyValid(111122)).toBe(true);
});

test('2019 day 4 part 2 answer', () => {
  expect(answer2).toBe(1462);
});