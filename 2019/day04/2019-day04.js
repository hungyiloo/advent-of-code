const input = [124075, 580769];

const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const all = (...fns) => x => fns.reduce((v, f) => v && f(x), true);
const range = size => Array(size).fill().map((_, i) => i);
const rangeFrom = (from, to) => range(to - from).map(x => x + from);

const digitizePassword = password =>
  password
    .toString()
    .split('')
    .map(c => parseInt(c));

const hasRepeats = condition => digits =>
  !!digits
    .reduce(
      (counts, currDigit, index, digits) =>
        index > 0 && digits[index - 1] === currDigit
          ? [...counts.slice(0, counts.length - 1), counts[counts.length - 1] + 1]
          : [...counts, 1],
      []
    )
    .find(condition);

const digitsIncrease = digits =>
  digits.reduce(
    (pass, currDigit, index, digits) => pass && (index === 0 || digits[index - 1] <= currDigit),
    true
  );

const isValid = pipe(digitizePassword, all(hasRepeats(r => r >= 2), digitsIncrease));
const isStrictlyValid = pipe(digitizePassword, all(hasRepeats(r => r === 2), digitsIncrease));

const answer1 = rangeFrom(input[0], input[1] + 1).filter(isValid).length;
console.log('2019 Day 4 Part 1:', answer1);

const answer2 = rangeFrom(input[0], input[1] + 1).filter(isStrictlyValid).length;
console.log('2019 Day 4 Part 2:', answer2);

module.exports = {
  rangeFrom,
  isValid,
  isStrictlyValid,
  answer1,
  answer2
};
