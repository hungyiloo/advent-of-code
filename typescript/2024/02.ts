import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/02.txt")).trim();

const parse = sss.array(/\r?\n/, sss.array(/ /, Number));
const reports = parse(puzzleInput);

function isSafe(report: (typeof reports)[0]) {
  const ascending = report
    .slice(1)
    .every((level, ii) => level > report[ii] && level - report[ii] <= 3);
  const descending = report
    .slice(1)
    .every((level, ii) => level < report[ii] && report[ii] - level <= 3);

  return ascending || descending;
}

console.log(
  "Part 1:",
  reports.reduce((count, report) => (isSafe(report) ? count + 1 : count), 0),
);

console.log(
  "Part 2:",
  reports.reduce((count, report) => {
    // If safe without modifications, count it
    if (isSafe(report)) return count + 1;

    // Otherwise, try removing each level;
    // if safe at any point, count it
    for (let ii = 0; ii < report.length; ii++)
      if (isSafe([...report.slice(0, ii), ...report.slice(ii + 1)]))
        return count + 1;

    // Else don't count it
    return count;
  }, 0),
);
