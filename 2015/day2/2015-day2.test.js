const { calculateWrappingPaper, calculateRibbonLength, answer1, answer2 } = require('./2015-day2');

test('2015 day 2 part 1 examples', () => {
  expect(calculateWrappingPaper('2x3x4')).toBe(58);
  expect(calculateWrappingPaper('1x1x10')).toBe(43);
});

test('2015 day 2 part 1 answer', () => {
  expect(answer1).toBe(1598415);
});

test('2015 day 2 part 2 examples', () => {
  expect(calculateRibbonLength('2x3x4')).toBe(34);
  expect(calculateRibbonLength('1x1x10')).toBe(14);
});

test('2015 day 2 part 2 answer', () => {
  expect(answer2).toBe(3812909);
});