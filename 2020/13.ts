import { getLines } from "../lib/streams.ts";

const inputData = getLines("13.input.txt");
const { value: timestampRaw } = await inputData.next();
const { value: scheduleRaw } = await inputData.next();
// const scheduleRaw = "17,x,13,19";

if (!timestampRaw || !scheduleRaw) Deno.exit();

const timestamp = parseInt(timestampRaw);

const schedule = scheduleRaw
  .split(",")
  .map((x) => x === "x" ? null : parseInt(x));

const busIds = schedule.filter((x) => x !== null) as number[];

const getBusWaitingTimesAt = (timestamp: number) =>
  busIds.map((busId) => ({
    busId,
    nextBusIn: (busId - (timestamp % busId)) % busId,
  }));

const nextBusAtTimestamp = getBusWaitingTimesAt(timestamp)
  .reduce((min, curr) => curr.nextBusIn < min.nextBusIn ? curr : min);

console.log("Part 1:", nextBusAtTimestamp.busId * nextBusAtTimestamp.nextBusIn);

