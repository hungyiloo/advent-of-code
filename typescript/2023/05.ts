import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2023/05.txt")).trim();

const parse = sss.partition(
  /(?:\r?\n){2}/,
  'seeds', sss.array(/ /, Number).slice(1),
  'maps', sss.array(
    /(?:\r?\n){2}/,
    sss.partition(
      / map\:\r?\n/,
      'name', String,
      'lookups', sss.array(
        /\r?\n/,
        sss.object(
          / /, 
          'dest', Number,
          'source', Number, 
          'range', Number
        )
      )
    )
  )
);

const { seeds, maps } = parse(puzzleInput);

function mapSingle(map: typeof maps[0], n: number): number {
  for (const { dest, source, range } of map.lookups) {
    if (source <= n && n <= source + range) {
      const delta = source - dest
      return n - delta
    }
  }
  return n
}

function mapAll(n: number): number {
  return maps.reduce((acc, map) => mapSingle(map, acc), n)
}

console.log("Part 1:", Math.min(...seeds.map(seed => mapAll(seed))))

let part2 = Infinity

const seedRanges = seeds.reduce((acc, curr, ii) => {
  if (ii % 2 === 0) {
    acc.push([curr])
  } else {
    acc[acc.length - 1].push(curr)
  }
  return acc
}, [] as number[][])

const searchGap = 40_000 // experimentally, this gap produces reasonably fast results for both phases

// Phase 1:
// For all the seed ranges, quickly find an *approximate* minimum result & seed.
// When iterating through the ranges, increment by `searchGap` to speed up the search.
let bestApproxMinSeed: number = NaN;
for (const [seed, range] of seedRanges) {
  for (let ii = 0; ii <= range/searchGap; ii++) {
    const approxMin = mapAll(seed + ii*searchGap)
    if (approxMin < part2) { 
      part2 = approxMin 
      bestApproxMinSeed = seed + ii*searchGap
    }
  }
}

// Phase 2:
// Once we've found the approximate best seed, we exhaustively search forward
// and backwards in single increments to the extent of `searchGap` to refine
// the approximate minimum into (hopefully) a true minimum
for (let ii = 0; ii <= searchGap; ii++) {
  const forward = mapAll(bestApproxMinSeed + ii)
  if (forward < part2) { 
    part2 = forward
  }
  const backward = mapAll(bestApproxMinSeed - ii)
  if (backward < part2) { 
    part2 = backward 
  }
}

console.log("Part 2:", part2)
