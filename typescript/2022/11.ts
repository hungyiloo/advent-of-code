const puzzleInput = (await Deno.readTextFile("../../input/2022/11.txt")).trim();

class Monkey {
  readonly id: string;
  readonly items: number[];
  private readonly operation: (old: number) => number;
  readonly divisor: number;
  private readonly passDestinationId: string;
  private readonly failDestinationId: string;
  private _inspections = 0;
  get inspections(): number { return this._inspections; }
  private set inspections(x: number) { this._inspections = x; }

  constructor(input: string) {
    const [
      idInput, itemsInput, operationInput,
      divisorInput, passInput, failInput
    ] = input.split('\n');

    this.id = idInput.replace(/[^\d]/g, '');

    this.items = itemsInput
      .trim()
      .replace('Starting items: ', '')
      .split(', ')
      .map(Number);

    const [left, op, right] = operationInput
      .trim()
      .replace('Operation: new = ', '')
      .split(' ');

    this.operation = (old: number): number => {
      const x = left === 'old' ? old : Number(left);
      const y = right === 'old' ? old : Number(right);
      switch (op) {
        case '+': return x + y;
        case '-': return x - y;
        case '*': return x * y;
        case '/': return x / y;
        default: throw new Error(`${op} isn't a valid operator`);
      }
    };

    this.divisor = Number(
      divisorInput
        .trim()
        .replace('Test: divisible by ', '')
    );

    this.passDestinationId = passInput
      .trim()
      .replace('If true: throw to monkey ', '')

    this.failDestinationId = failInput
      .trim()
      .replace('If false: throw to monkey ', '')
  }

  play(relief: boolean, globalDivisor: number) {
    const transfers = this.items.map(item => {
      this.inspections++;

      item = this.operation(item);

      // If we're not that anxious yet (part 1),
      // worry levels can be divided by 3 and floored
      if (relief) {
        item /= 3;
        item = Math.floor(item);
      }

      // "keep your worry levels manageable"
      item = item % globalDivisor;

      return {
        send: item,
        to: item % this.divisor === 0
          ? this.passDestinationId
          : this.failDestinationId
      };
    });
    this.items.length = 0;
    return transfers;
  }

  receive(item: number) {
    this.items.push(item);
  }
}

const simulate = (rounds: number, relief: boolean) => {
  // Split the puzzle input into input for each monkey
  // based on the blank lines, then construct a Monkey
  // object for each.
  const monkeys = puzzleInput
    .split('\n\n')
    .map(monkeyInput => new Monkey(monkeyInput));

  // Create a Map of Monkeys, keyed by ID.
  // This makes it easy for us to find a destination monkey
  // when transferring items later.
  const monkeyMap = new Map(monkeys.map(m => [m.id, m]));

  // Calculate the global divisor by getting the product
  // of every monkey's divisor. When we mod by this global
  // value, each monkey's divisor test will have the same
  // pass/fail behavior but the actual numbers will be
  // smaller and more manageable.
  const globalDivisor = monkeys
    .map(m => m.divisor)
    .reduce((p, x) => p * x);

  // For each round, each monkey inspects its items,
  // and each transfer needs to be received by the
  // destination monkey.
  for (let round = 0; round < rounds; round++)
    for (const monkey of monkeys)
      for (const { send, to } of monkey.play(relief, globalDivisor))
        monkeyMap.get(to)!.receive(send);

  // Calculate the puzzle answer by getting the top 2
  // monkeys by inspection count, then multiply.
  return monkeys
    .map(m => m.inspections)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((p, x) => p * x, 1);
}

const part1 = simulate(20, true);
const part2 = simulate(10000, false);

console.log("Part 1:", part1);
console.log("Part 2:", part2);
