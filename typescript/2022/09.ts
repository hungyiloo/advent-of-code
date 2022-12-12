const puzzleInput = (await Deno.readTextFile("../../input/2022/09.txt")).trim();

const movements = puzzleInput.split('\n')
  .map(line => ({
    direction: line[0],
    steps: parseInt(line.slice(2))
  }));

type Knot = readonly [number, number];
type Rope = Knot[];

const follow1D = (head: number, tail: number) => {
  if (head === tail) return tail;
  if (head > tail) return tail + 1;
  else return tail - 1;
}

const follow2D = (
  [headX, headY]: Knot,
  [tailX, tailY]: Knot
) => {
  // head and tail still touching; tail doesn't move
  if (Math.abs(headX - tailX) <= 1
      && Math.abs(headY - tailY) <= 1) {
    return [tailX, tailY] as const;
  }
  // otherwise, move the tail closer to the head
  return [
    follow1D(headX, tailX),
    follow1D(headY, tailY)
  ] as Knot;
}

const simulate = (ropeLength: number) => {
  let rope = Array(ropeLength).fill([0,0]);
  const tailPositions = new Set<string>();

  for (const { direction, steps } of movements) {
    Array(steps).fill(0).forEach(() => {
      let [headX, headY] = rope[0];
      switch (direction) {
        case 'U': headX--; break;
        case 'D': headX++; break;
        case 'L': headY--; break;
        case 'R': headY++; break;
      }
      rope = rope.map(
        (knot, ii) =>
          ii === 0
            ? [headX, headY]
            : follow2D(rope[ii - 1], knot)
      );
      tailPositions.add(rope[rope.length - 1].join(','));
    });
  }

  return tailPositions.size;
}

const part1 = simulate(2);
const part2 = simulate(10);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
