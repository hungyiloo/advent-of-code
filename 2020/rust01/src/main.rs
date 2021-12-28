use std::fs::File;
use std::io::{BufRead, BufReader};

fn main() {
    let numbers = get_numbers().into_iter();

    let pairs = numbers
        .clone()
        .flat_map(|n1| numbers.clone().map(move |n2| (n1, n2)));
    let (n1, n2) = pairs.clone().find(|(n1, n2)| n1 + n2 == 2020).unwrap();
    println!("Part 1: {}", n1 * n2);

    let triplets = pairs.flat_map(|(n1, n2)| numbers.clone().map(move |n3| (n1, n2, n3)));
    let (n1, n2, n3) = triplets
        .clone()
        .find(|(n1, n2, n3)| n1 + n2 + n3 == 2020)
        .unwrap();
    println!("Part 2: {}", n1 * n2 * n3);
}

fn get_numbers() -> Vec<i64> {
    let file = File::open("../01.input.txt").expect("puzzle input file not found");
    let reader = BufReader::new(file);
    return reader
        .lines()
        .map(|line| line.unwrap().parse::<i64>().unwrap())
        .collect();
}
