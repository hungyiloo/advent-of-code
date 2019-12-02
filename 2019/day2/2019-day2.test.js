const { execute, answer1, answer2 } = require('./2019-day2');

test('2019 day 2 part 1 examples', () => {
  expect(execute([1,9,10,3,2,3,11,0,99,30,40,50]).toString()).toBe('3500,9,10,70,2,3,11,0,99,30,40,50');
  expect(execute([1,0,0,0,99]).toString()).toBe('2,0,0,0,99');
  expect(execute([2,3,0,3,99]).toString()).toBe('2,3,0,6,99');
  expect(execute([2,4,4,5,99,0]).toString()).toBe('2,4,4,5,99,9801');
  expect(execute([1,1,1,4,99,5,6,0,99]).toString()).toBe('30,1,1,4,2,5,6,0,99');
});

test('2019 day 2 part 1 answer', () => {
  expect(answer1).toBe(7210630);
});