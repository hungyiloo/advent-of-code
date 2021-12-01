import { readLines } from "https://deno.land/std@0.116.0/io/mod.ts";
import * as path from "https://deno.land/std@0.116.0/path/mod.ts";

async function* depths() {
  const filename = path.join(Deno.cwd(), "./01.input.txt");
  const fileReader = await Deno.open(filename);
  for await (const line of readLines(fileReader)) {
    yield parseInt(line);
  }
}

async function* pairwise<T>(generator: AsyncGenerator<T>) {
  let previous: T | null = null;

  for await (const element of generator) {
    if (previous !== null) {
      yield [previous, element];
    }
    previous = element;
  }
}

let sinking = 0;
for await (const [previousDepth, currentDepth] of pairwise(depths())) {
  if (currentDepth > previousDepth) sinking++;
}

console.log("Part 1:", sinking);

async function* windows<T>(generator: AsyncGenerator<T>, windowSize: number) {
  const win: T[] = [];

  for await (const element of generator) {
    win.push(element);
    if (win.length === windowSize) {
      yield [...win];
      win.shift();
    }
  }
}

function sum(arr: number[]) {
  return arr.reduce((acc, curr) => acc + curr)
}

sinking = 0;
for await (const [previousDepths, currentDepths] of pairwise(windows(depths(), 3))) {
  if (sum(currentDepths) > sum(previousDepths)) sinking++;
}

console.log("Part 2:", sinking);
