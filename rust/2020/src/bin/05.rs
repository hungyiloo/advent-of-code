use std::{
    fs::File,
    io::{BufRead, BufReader},
};

fn main() {
    let boarding_passes = get_boarding_passes();

    let seat_ids = boarding_passes
        .iter()
        .map(|p| {
            let (row, col) = parse_boarding_pass(p);
            return (row * 8) + col;
        })
        .collect::<Vec<isize>>();
    println!("Part 1: {}", seat_ids.iter().max().unwrap());

    let my_seat_id = seat_ids
        .iter()
        .flat_map(|id1| seat_ids.iter().map(move |id2| (id1, id2))) // map to all possible pairs
        .filter(|(&id1, &id2)| (id1 - id2).abs() == 2) // find seat ids with a gap in between (2 apart)
        .map(|(&id1, &id2)| (id1 + id2) / 2) // resolve to the seat in between
        .find(|id| !seat_ids.contains(id)) // find one that is missing from the original list
        .unwrap();
    println!("Part 2: {}", my_seat_id);
}

fn parse_boarding_pass(pass: &str) -> (isize, isize) {
    let fb = pass.chars().filter(|c| *c == 'F' || *c == 'B');
    let lr = pass.chars().filter(|c| *c == 'L' || *c == 'R');
    let (row, _) = fb.fold((0, 127), |(low, high), c| {
        let distance = high - low;
        match c {
            'F' => (low, high - (distance / 2)),
            'B' => (low + ((distance + 1) / 2), high),
            _ => panic!("Invalid boarding pass"),
        }
    });
    let (col, _) = lr.fold((0, 7), |(low, high), c| {
        let distance = high - low;
        match c {
            'L' => (low, high - (distance / 2)),
            'R' => (low + ((distance + 1) / 2), high),
            _ => panic!("Invalid boarding pass"),
        }
    });
    return (row, col);
}

fn get_boarding_passes() -> Vec<String> {
    let file = File::open("../../input/2020/05.txt").expect("puzzle input file not found");
    let reader = BufReader::new(file);
    return reader.lines().map(|line| line.unwrap()).collect();
}
