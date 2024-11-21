import sss from "../lib/parsing.ts";

const puzzleInput = (await Deno.readTextFile("../../input/2023/05.txt")).trim();

const parse = sss.partition(
  /(?:\r?\n){2}/,
  'seeds', sss.array(/ /, Number).slice(1),
  'maps', sss.array(
    /(?:\r?\n){2}/,
    sss.partition(
      / map\:\r?\n/,
      'direction', sss.object(
        /-to-/, 
        'from', String, 
        'to', String
      ),
      'table', sss.array(
        /\r?\n/,
        sss.tuple(/ /, Number, Number, Number)
      )
    )
  )
);

const data = parse(puzzleInput);

console.log(data);
