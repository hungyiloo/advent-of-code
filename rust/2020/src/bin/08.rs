use std::{
    collections::HashSet,
    fmt,
    fs::File,
    io::{BufRead, BufReader},
};

fn main() {
    let instructions = get_instructions();

    let (result, _) = execute(&instructions, None);
    println!("Part 1: {:?}", result);

    let swap_positions: Vec<usize> =
        instructions
            .iter()
            .enumerate()
            .filter(|(_, instruction)| match instruction {
                Instruction(op, _) => *op == Operation::NOP || *op == Operation::JMP,
            })
            .map(|(position, _)| position)
            .collect();

    for swap_position in swap_positions {
        let (result, looped) = execute(&instructions, Some(swap_position));
        if !looped {
            println!("Part 2: {}", result);
            break;
        }
    }
}

fn execute(instructions: &Vec<Instruction>, swap: Option<usize>) -> (i32, bool) {
    let mut visited = HashSet::<usize>::new();
    let mut cursor: usize = 0;
    let mut accumulator: i32 = 0;
    while !visited.contains(&cursor) && cursor < instructions.len() {
        visited.insert(cursor);
        let Instruction(op, arg) = instructions[cursor];

        // Swap/correction behavior to test for corruption
        let op = match (swap, op) {
            (Some(s), Operation::JMP) if s == cursor => Operation::NOP,
            (Some(s), Operation::NOP) if s == cursor => Operation::JMP,
            _ => op,
        };

        // Update the execution state based on operation & argument
        match op {
            Operation::ACC => {
                accumulator += arg as i32;
                cursor += 1;
            }
            Operation::JMP => {
                let maybe_cursor = (cursor as isize) + arg;
                cursor = usize::try_from(maybe_cursor).unwrap();
            }
            Operation::NOP => {
                cursor += 1;
            }
        }
    }
    let looped = visited.contains(&cursor);
    return (accumulator, looped);
}

fn get_instructions() -> Vec<Instruction> {
    let file = File::open("../../input/2020/08.txt").expect("puzzle input file not found");
    let reader = BufReader::new(file);
    let mut instructions: Vec<Instruction> = vec![];
    for line in reader.lines() {
        let line = line.unwrap();
        let mut parts = line.split(" ").into_iter();
        let operation = match parts.next() {
            Some("acc") => Operation::ACC,
            Some("jmp") => Operation::JMP,
            Some("nop") => Operation::NOP,
            Some(_) | None => panic!("invalid instruction"),
        };
        let argument = parts
            .next()
            .unwrap()
            .replace("+", "")
            .parse::<isize>()
            .unwrap();
        instructions.push(Instruction(operation, argument));
    }
    return instructions;
}

#[derive(Copy, Clone, PartialEq)]
enum Operation {
    ACC,
    JMP,
    NOP,
}
struct Instruction(Operation, isize);

impl fmt::Debug for Instruction {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Instruction(Operation::ACC, arg) => {
                write!(f, "acc {}{:?}", if arg > &0 { "+" } else { "" }, arg)
            }
            Instruction(Operation::JMP, arg) => {
                write!(f, "jmp {}{:?}", if arg > &0 { "+" } else { "" }, arg)
            }
            Instruction(Operation::NOP, arg) => {
                write!(f, "nop {}{:?}", if arg > &0 { "+" } else { "" }, arg)
            }
        }
    }
}
