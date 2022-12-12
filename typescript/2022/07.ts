const puzzleInput = (await Deno.readTextFile("../../input/2022/07.txt")).trim();

// Returns ancestor paths of a given file or directory path.
const ancestors = (path: string) => path
  .split('/')
  .slice(1, -1)
  .reduce(
    (acc, curr) => [...acc, pathJoin(acc[acc.length - 1], curr)],
    ['/']
  );

// Joins the given path segments
// and removes trailing slashes from each segment.
const pathJoin = (...paths: string[]) => paths
  .map(path => path?.replace(/\/$/, '') ?? '')
  .join('/');

// This code processes a string containing a sequence of
// commands and files/directories, and returns an array
// of sizes for each directory in the file system.
const { dirSizeMap } = puzzleInput.split('\n').reduce(
  ({ cwd, dirSizeMap }, line) => {
    if (line.startsWith("$")) {
      // Terminal Input
      const [,cmd,arg] = line.split(' ');
      return {
        cwd: cmd === 'cd'
          ? arg === '/'
            ? '/'
            : arg === '..'
              ? ancestors(cwd).slice(-1)[0]
              : pathJoin(cwd, arg)
          : cwd,
        dirSizeMap
      }
    } else {
      // Terminal Output
      const [left, right] = line.split(' ');
      const size = left !== 'dir' ? parseInt(left) : undefined;
      const path = pathJoin(cwd, right);
      return {
        cwd,
        dirSizeMap: size
          ? ancestors(path)
            .map(path => [path, size] as const)
            .reduce(
              (map, [path, size]) =>
                map.set(path, (map.get(path) ?? 0) + size),
              dirSizeMap
            )
          : dirSizeMap
      }
    }
  },
  { cwd: '', dirSizeMap: new Map<string, number>() }
);

const dirSizes = [...dirSizeMap.values()];

const part1 = dirSizes
  .filter(s => s <= 100_000)
  .reduce((s, x) => s + x, 0);

const totalDiskSpace = 70_000_000;
const usedDiskSpace = dirSizeMap.get('/')!;
const unusedDiskSpace  = totalDiskSpace - usedDiskSpace;
const requiredDiskSpace = 30_000_000;
const diskSpaceToFree = requiredDiskSpace - unusedDiskSpace;

const part2 = Math.min(
  ...dirSizes.filter(s => s >= diskSpaceToFree)
);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
