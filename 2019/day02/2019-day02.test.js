const { executeProgramInMemory, product, range, answer1, answer2 } = require('./2019-day02');

test('2019 day 2 part 1 examples', () => {
  expect(executeProgramInMemory([1,9,10,3,2,3,11,0,99,30,40,50])).toStrictEqual([3500,9,10,70,2,3,11,0,99,30,40,50]);
  expect(executeProgramInMemory([1,0,0,0,99])).toStrictEqual([2,0,0,0,99]);
  expect(executeProgramInMemory([2,3,0,3,99])).toStrictEqual([2,3,0,6,99]);
  expect(executeProgramInMemory([2,4,4,5,99,0])).toStrictEqual([2,4,4,5,99,9801]);
  expect(executeProgramInMemory([1,1,1,4,99,5,6,0,99])).toStrictEqual([30,1,1,4,2,5,6,0,99]);
});

test('2019 day 2 part 1 answer', () => {
  expect(answer1).toBe(7210630);
});

test('2019 day 2 part 2 cartesian product', () => {
  expect(product([1,2],[3,4])).toStrictEqual([[1,3],[1,4],[2,3],[2,4]]);
  expect(product([1,2],[3])).toStrictEqual([[1,3],[2,3]]);
  expect(product([1],[3,4])).toStrictEqual([[1,3],[1,4]]);
});

test('2019 day 2 part 2 range', () => {
  expect(range(0)).toStrictEqual([]);
  expect(range(1)).toStrictEqual([0]);
  expect(range(2)).toStrictEqual([0,1]);
  expect(range(3)).toStrictEqual([0,1,2]);
});

test('2019 day 2 part 2 answer', () => {
  expect(answer2).toBe(3892);
});