const puzzleInput = (await Deno.readTextFile("../../input/2023/01.txt")).trim();

const lines = puzzleInput.split(/\r?\n/);

const findCalibrationValue = (digits: Record<string, string>) => {
  const regex = new RegExp(Object.keys(digits).join("|"), "g");
  return (line: string) => {
    const result = [];
    let match = regex.exec(line);
    while (match) {
      result.push(digits[match[0]]);
      // instead of the default behavior where the next regex match is from the
      // end of the last match, we want to search exhaustively at every position,
      // even within matches. This catches the 'twone' -> '21' scenario.
      regex.lastIndex = match.index + 1;
      match = regex.exec(line);
    }
    return Number(result[0] + result[result.length - 1]);
  };
};

const sum = (x: number, sum: number) => sum + x;

const part1 = lines
  .map(
    findCalibrationValue({
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7",
      "8": "8",
      "9": "9",
    }),
  )
  .reduce(sum);
console.log("Part 1:", part1);

const part2 = lines
  .map(
    findCalibrationValue({
      one: "1",
      two: "2",
      three: "3",
      four: "4",
      five: "5",
      six: "6",
      seven: "7",
      eight: "8",
      nine: "9",
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7",
      "8": "8",
      "9": "9",
    }),
  )
  .reduce(sum);
console.log("Part 2:", part2);
