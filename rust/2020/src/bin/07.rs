use std::{
    collections::HashSet,
    fs::File,
    io::{BufRead, BufReader},
};

fn main() {
    let links = get_links();

    let parents = find_all_possible_parents("shiny gold", &links);
    println!("Part 1: {}", parents.len());

    let count = count_containing_bags("shiny gold", &links);
    println!("Part 2: {}", count);
}

fn find_all_possible_parents<'a>(
    target: &str,
    links: &'a Vec<(String, usize, String)>,
) -> HashSet<&'a str> {
    let mut visited = HashSet::<&str>::new();
    let mut current: Vec<&str> = vec![target];
    while !current.is_empty() {
        let mut next: Vec<&str> = vec![];
        for (child, _, parent) in links {
            if current.contains(&(child as &str)) {
                next.push(parent);
                visited.insert(parent);
            }
        }
        current = next;
    }
    return visited;
}

fn count_containing_bags(target: &str, links: &Vec<(String, usize, String)>) -> u64 {
    let mut total_count: u64 = 0;
    let mut current: Vec<(&str, u64)> = links
        .iter()
        .filter(|(_, _, parent)| parent == target)
        .map(|(child, num, _)| (child as &str, *num as u64))
        .collect();
    while !current.is_empty() {
        let mut next: Vec<(&str, u64)> = vec![];
        for (bag, count) in current.drain(..) {
            // check for children and queue them for the next level of search
            let matching_links = links.iter().filter(|(_, _, parent)| parent == bag);
            for (child, num, _) in matching_links {
                // multiply by the count of the parent
                next.push((child as &str, (*num as u64) * count));
            }
            // make sure to count the current bags in the result
            total_count += count;
        }
        current = next;
    }
    return total_count;
}

fn get_links() -> Vec<(String, usize, String)> {
    let file = File::open("../../input/2020/07.txt").expect("puzzle input file not found");
    let reader = BufReader::new(file);
    let mut links: Vec<(String, usize, String)> = vec![];
    for line in reader.lines() {
        let line = line.unwrap().replace(".", "");
        let mut parts = line.split(" contain ").into_iter();
        let parent = parts.next().unwrap().replace("bags", "").trim().to_owned();
        let rest = parts.next().unwrap();
        if rest == "no other bags" {
            continue;
        }
        for bag_def in rest.split(", ") {
            let mut parts = bag_def.split(" ").into_iter();
            let num = parts.next().unwrap().parse::<usize>().unwrap();
            let child = parts.next().unwrap().to_owned() + " " + parts.next().unwrap();
            links.push((child, num, parent.clone()));
        }
    }
    return links;
}
