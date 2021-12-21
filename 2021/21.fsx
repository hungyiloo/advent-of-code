#load "../lib/Memoization.fsx"
open Memoization
open System.IO
open System

let (|Split|) (separator: string) (s: string) =
  match s.Trim().Split([| separator |], StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList

let p1Start, p2Start =
  File.ReadAllLines "21.input.txt"
  |> Seq.toList
  |> List.map
    (fun line ->
      match line with
      | Split " " [ "Player"; _; "starting"; "position:"; pos ] -> pos
      | _ -> failwith "Invalid input format")
  |> (function
      | [ p1; p2 ] -> int p1, int p2
      | _ -> failwith "Invalid input format")

let nextPosition currentPos steps = ((currentPos - 1) + steps) % 10 + 1

let practiceGame p1Start p2Start =
  let dice = seq { while true do for i in 1..100 do yield i }

  let roll totalRolls =
    let n = 3
    dice |> Seq.skip (totalRolls % 100) |> Seq.take n,
    totalRolls + n

  let move stepList (score, position) =
    let position = nextPosition position (stepList |> Seq.sum)
    score + position,
    position

  let finished players =
    match players with
    | [] -> false
    | _ -> (players |> Seq.map fst |> Seq.max) >= 1000

  let scoreGame (totalRolls, players) =
    match players with
    | [] -> failwith "Can't score a game without players"
    | _ -> (players |> Seq.map fst |> Seq.min) * totalRolls

  let rec play (totalRolls, players) =
    if finished players then
      totalRolls, players
    else
      let totalRolls, players =
        ((totalRolls, []), players)
        ||> Seq.fold
          (fun (totalRolls, players) player ->
            if finished players then
              totalRolls, player::players
            else
              let rolls, totalRolls = roll totalRolls
              let player = move rolls player
              totalRolls, player::players)
      play (totalRolls, players |> List.rev)

  let players = [(0, p1Start); (0, p2Start)]
  play (0, players) |> scoreGame

practiceGame p1Start p2Start
|> printfn "Part 1: %A"

let comb n source =
  let rec recurse n result =
    match n, result with
    | 1, result -> result
    | _ -> recurse (n-1) (result |> Seq.collect (fun r -> source |> Seq.map (fun s -> s::r)))
  recurse n (source |> Seq.map (fun s -> [s]))

let diracOutcomes =
  comb 3 [1; 2; 3]
  |> Seq.map Seq.sum
  |> Seq.toList

#nowarn "40"
let rec wins =
  memoize
    (fun (score1, pos1, score2, pos2) ->
      diracOutcomes
      |> List.collect
        (fun steps1 ->
          let pos1 = nextPosition pos1 steps1
          let score1 = score1 + pos1
          if score1 >= 21
          then [(1L, 0L)]
          else
            diracOutcomes
            |> List.map
              (fun steps2 ->
                let pos2 = nextPosition pos2 steps2
                let score2 = score2 + pos2
                if score2 >= 21
                then (0L, 1L)
                else wins (score1, pos1, score2, pos2)))
      |> List.reduce (fun (a, b) (a', b') -> (a + a', b + b')))

let win1, win2 = wins (0, p1Start, 0, p2Start)
printfn "Part 2: %d" (if win1 > win2 then win1 else win2)
