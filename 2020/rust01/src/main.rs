use std::fs::File;
use std::io::{BufRead, BufReader};

fn main() {
    let numbers = get_numbers();

    let mut part1 = 0;
    let mut part2 = 0;

    for x in &numbers {
        for y in &numbers {
            if x + y == 2020 {
                part1 = x * y;
            }
            for z in &numbers {
                if x + y + z == 2020 {
                    part2 = x * y * z;
                }
            }
        }
    }

    println!("Part 1: {}", part1);
    println!("Part 2: {}", part2);
}

fn get_numbers() -> Vec<i64> {
    let file = File::open("../01.input.txt").expect("puzzle input file not found");
    let reader = BufReader::new(file);
    return reader
        .lines()
        .map(|line| line.unwrap().parse::<i64>().unwrap())
        .collect();
}
