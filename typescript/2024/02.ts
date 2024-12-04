import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/02.txt")).trim();

const parse = sss.array(/\r?\n/, sss.array(/ /, Number));
const reports = parse(puzzleInput);

function isSafe(report: (typeof reports)[0]) {
  let safe = true;
  let order: null | "increasing" | "decreasing" = null;
  for (let ii = 1; ii < report.length; ii++) {
    const delta = report[ii] - report[ii - 1];
    if (Math.abs(delta) < 1 || Math.abs(delta) > 3) {
      safe = false;
      break;
    }
    if (!order) {
      order = delta > 0 ? "increasing" : "decreasing";
    } else if (
      (order === "increasing" && delta < 0) ||
      (order === "decreasing" && delta > 0)
    ) {
      safe = false;
      break;
    }
  }

  return safe;
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
