import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2024/09.txt")).trim();

const parse = sss.array('', Number)
const diskMap = parse(puzzleInput).map((length, ii) => ({ id: ii % 2 ? null : ii/2, length }))

function clone<T>(o: T): T { return JSON.parse(JSON.stringify(o)) }

function compress(disk: typeof diskMap) {
  disk = clone(disk)
  return disk.reduce(
    (acc, curr, ii) => {
      if (curr.id !== null && curr.length > 0) {
        acc.push(curr)
      } else {
        let freeSpace = curr.length
        while (freeSpace > 0) {
          const lastFileIndex = disk.findLastIndex(f => f.id !== null)!
          if (lastFileIndex <= ii) break;
          const lastFile = disk[lastFileIndex]
          if (freeSpace >= lastFile.length) {
            acc.push({ ...lastFile })
            freeSpace -= lastFile.length
            disk.length = lastFileIndex
          } else {
            acc.push({ ...lastFile, length: freeSpace })
            lastFile.length -= freeSpace
            if (lastFile.length === 0) {
              disk.length = lastFileIndex
            }
            freeSpace = 0
          }
        }
      }
      return acc
    },
    [] as typeof disk
  )
}

function checksum(disk: typeof diskMap) {
  let result = 0;
  let position = 0;
  for (const segment of disk) {
    if (segment.id !== null) {
      const sumOfRange = (segment.length/2 * (2*position + segment.length - 1)) 
      result += sumOfRange * segment.id
    }
    position += segment.length
  }
  return result
}

console.log("Part 1:", checksum(compress(diskMap)))

function compressDefrag(disk: typeof diskMap) {
  disk = clone(disk)

  // Iterate through files in reverse
  for (const file of disk.filter(s => s.id !== null).reverse()) {
    // Find the position of the file on the current disk state
    const fileIndex = disk.indexOf(file)

    // so that we can find the first free space that fits
    const spaceIndex = disk
      .slice(0, fileIndex) // but only if its left of the file
      .findIndex(s => s.id === null && s.length >= file.length)

    // and if there's no big enough space, skip this file
    if (spaceIndex === -1) continue

    // move the file
    const space = disk[spaceIndex]
    if (space.length === file.length) {
      space.id = file.id
    } else {
      // and reallocate any leftover free space, if space > file
      disk.splice(spaceIndex, 1, { ...file }, { id: null , length: space.length - file.length })
    }
    file.id = null
  }

  return disk
}

console.log("Part 2:", checksum(compressDefrag(diskMap)))
