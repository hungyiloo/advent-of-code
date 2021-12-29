use std::{
    fs::File,
    io::{BufRead, BufReader},
};

fn main() {
    let records = get_password_records();

    let mut part1 = 0;
    let mut part2 = 0;

    for record in records {
        if record_valid_by_letter_count(&record) {
            part1 += 1;
        }
        if record_valid_by_letter_positions(&record) {
            part2 += 1;
        }
    }

    println!("Part 1: {}", part1);
    println!("Part 2: {}", part2);
}

struct PasswordRecord(usize, usize, char, String);

fn record_valid_by_letter_count(record: &PasswordRecord) -> bool {
    let PasswordRecord(low, high, letter, password) = record;
    let letter_count = password.chars().filter(|c| c == letter).count();
    return low <= &letter_count && &letter_count <= high;
}

fn record_valid_by_letter_positions(record: &PasswordRecord) -> bool {
    let PasswordRecord(low, high, letter, password) = record;
    let low_match = match password.chars().nth(*low - 1) {
        Some(c) => c == *letter,
        None => false,
    };
    let high_match = match password.chars().nth(*high - 1) {
        Some(c) => c == *letter,
        None => false,
    };
    return low_match != high_match;
}

fn get_password_records() -> Vec<PasswordRecord> {
    let file = File::open("../../input/2020/02.txt").expect("puzzle input file not found");
    let reader = BufReader::new(file);
    return reader
        .lines()
        .map(|line_result| {
            let line = line_result.unwrap();
            let mut parts = line.split(": ");
            let mut spec = parts.next().unwrap().split(" ");
            let password = parts.next().unwrap().to_string();
            let mut range = spec.next().unwrap().split("-");
            let letter = spec.next().unwrap().chars().next().unwrap();
            let low = range.next().unwrap().parse::<usize>().unwrap();
            let high = range.next().unwrap().parse::<usize>().unwrap();
            return PasswordRecord(low, high, letter, password);
        })
        .collect();
}
