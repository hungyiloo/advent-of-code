use std::{
    collections::HashSet,
    fs::File,
    io::{BufRead, BufReader},
};

fn main() {
    let groups = get_groups();

    let part1: usize = groups.iter().map(count_unique_questions).sum();
    println!("Part 1: {}", part1);

    let part2: usize = groups.iter().map(count_common_questions).sum();
    println!("Part 2: {}", part2);
}

fn count_unique_questions(group: &Vec<String>) -> usize {
    let mut set = HashSet::<char>::new();
    for person in group {
        person.chars().for_each(|c| {
            set.insert(c);
        });
    }
    return set.len();
}

fn count_common_questions(group: &Vec<String>) -> usize {
    let mut sets: Vec<HashSet<char>> = vec![];
    for person in group {
        let set = HashSet::<char>::from_iter(person.chars());
        sets.push(set);
    }

    let mut sets_iter = sets.iter();
    let mut combined = sets_iter.next().unwrap().clone();
    for set in sets_iter {
        combined = &combined & set;
    }
    return combined.len();
}

fn get_groups() -> Vec<Vec<String>> {
    let file = File::open("../../input/2020/06.txt").expect("puzzle input file not found");
    let reader = BufReader::new(file);
    let mut groups: Vec<Vec<String>> = vec![];
    let mut group: Vec<String> = vec![];
    for line in reader.lines() {
        let line = line.unwrap();
        if line.is_empty() {
            groups.push(group);
            group = vec![];
        } else {
            group.push(line);
        }
    }
    groups.push(group);
    return groups;
}
