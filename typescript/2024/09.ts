import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/09.txt")).trim();

const parse = sss.array('', Number)
const diskMap = parse(puzzleInput).map((length, ii) => ({ id: ii % 2 ? null : ii/2, length }))

function deepClone<T>(o: T): T { return JSON.parse(JSON.stringify(o)) }

// NOTE: The solution would be faster with dedicated implementations for each part,
//       but it's much more satisfying to have the same code work for both parts.
function compress(disk: typeof diskMap, defrag: boolean) {
  disk = deepClone(disk)

  for (const file of disk.filter(s => s.id !== null).reverse()) {
    while (file.id) {
      // Find the first free space that fits
      const spaceIndex = disk.findIndex(s => s.id === null && (!defrag || s.length >= file.length))

      // If there's no suitable space, skip this file.
      // Also abort if the free space is not to the left of the file.
      if (spaceIndex === -1 || spaceIndex >= disk.indexOf(file)) break;

      // Move the file
      const space = disk[spaceIndex]
      if (space.length === file.length) {
        space.id = file.id
        file.id = null
      } else if (space.length < file.length) {
        space.id = file.id
        file.length -= space.length
        // commented out for speed -- while technically correct, not necessary for answers
        // disk.splice(disk.indexOf(file) + 1, 0, { id: null, length: space.length })
      } else {
        space.length -= file.length
        disk.splice(spaceIndex, 0, { ...file })
        file.id = null
      }
    }
  }

  return disk
}

function checksum(disk: typeof diskMap) {
  let result = 0;
  let position = 0;
  for (const segment of disk) {
    if (segment.id !== null) {
      // adapted formula for sum of a range of integers (S = n(a + l)/2)
      result += segment.length * (2*position + segment.length - 1) / 2 * segment.id 
    }
    position += segment.length
  }
  return result
}

console.log("Part 1:", checksum(compress(diskMap, false)))
console.log("Part 2:", checksum(compress(diskMap, true)))
