#load "../lib/Memoization.fsx"
open Memoization

open System.IO
open System
let dice = seq { while true do for i in 1..100 do yield i }
let positions = seq { while true do for i in 1..10 do yield i }

let roll totalRolls =
  let n = 3
  dice |> Seq.skip (totalRolls % 100) |> Seq.take n,
  totalRolls + n


let move steps (score, position) =
  let position = positions |> Seq.skip (position + (Seq.sum steps) - 1) |> Seq.head
  score + position,
  position

let repeat n fn = Seq.replicate n fn |> Seq.reduce (>>)

let finished players threshold =
  match players with
  | [] -> false
  | _ -> (players |> Seq.map fst |> Seq.max) >= threshold

let scoreGame (totalRolls, players) =
  match players with
  | [] -> failwith "Can't score a game without players"
  | _ -> (players |> Seq.map fst |> Seq.min) * totalRolls

let game threshold =
  let totalRolls = 0
  let players = [ (0, 3); (0, 5) ]

  let rec play (totalRolls, players) =
    if finished players threshold then
      totalRolls, players
    else
      let totalRolls, players =
        ((totalRolls, []), players)
        ||> Seq.fold
          (fun (totalRolls, players) player ->
            if finished players threshold then
              totalRolls, player::players
            else
              let rolls, totalRolls = roll totalRolls
              let player = move rolls player
              totalRolls, player::players)
      play (totalRolls, players |> List.rev)

  play (totalRolls, players) |> scoreGame

// game 1000
// |> printfn "Part 1: %A"

// let round ((score, position), universes) (steps, multiplier) =
//   let nextPosition = ((position - 1) + steps) % 10 + 1
//   (score + nextPosition, nextPosition), universes * multiplier

let next position steps = ((position - 1) + steps) % 10 + 1

let comb n source =
  let rec recurse n result =
    match n, result with
    | 1, result -> result
    | _ -> recurse (n-1) (result |> Seq.collect (fun r -> source |> Seq.map (fun s -> s::r)))
  recurse n (source |> Seq.map (fun s -> [s]))

let regroup (counts: seq<'a * int64>) =
  counts
  |> Seq.groupBy fst
  |> Seq.map (fun (key, partialCounts) -> key, Seq.sumBy snd partialCounts)

let inline (++) xs ys = xs |> List.collect (fun x -> ys |> List.map (fun y -> x, y))

let outcomes =
  comb 3 [1; 2; 3]
  |> Seq.map Seq.sum
  // |> Seq.countBy id
  // |> Seq.map (fun (x, count) -> x, int64 count)
  |> Seq.toList

let twoPlayerOutcomes = outcomes ++ outcomes

let rec wins =
  memoize
    (fun (score1, pos1, score2, pos2) ->
     match score1, score2 with
     | s1, _ when s1 >= 21 -> (1L, 0L)
     | _, s2 when s2 >= 21 -> (0L, 1L)
     | _ ->
        twoPlayerOutcomes
        |> Seq.map
          (fun (steps1, steps2) ->
            let pos1 = next pos1 steps1
            let score1 = score1 + pos1
            let pos2 = next pos2 steps2
            let score2 = score2 + pos2
            // printfn "%A" (score1, pos1, score2, pos2)
            wins (score1, pos1, score2, pos2))
        |> Seq.reduce (fun (a, b) (a', b') -> (a + a', b + b')))

printfn "%A" (wins (0, 4, 0, 8))
// printfn "%A" (next 9 5)

// outcomes
// |> Seq.map (fun x -> round ((0,1), 1L) x)
// |> regroup
// |> Seq.collect (fun s -> outcomes |> Seq.map (fun o -> round s o))
// |> regroup
// |> Seq.collect (fun s -> outcomes |> Seq.map (fun o -> round s o))
// |> regroup
// |> Seq.collect (fun s -> outcomes |> Seq.map (fun o -> round s o))
// |> regroup
// |> Seq.collect (fun s -> outcomes |> Seq.map (fun o -> round s o))
// |> regroup
// |> Seq.collect (fun s -> outcomes |> Seq.map (fun o -> round s o))
// |> regroup
// |> Seq.collect (fun s -> outcomes |> Seq.map (fun o -> round s o))
// |> regroup
// // |> Seq.toList
// |> Seq.sumBy snd
// |> printfn "%A"

// comb 8 outcomes
// |> Seq.map
//   (fun rolls ->
//    let rolls1, rolls2 = rolls |> List.take 4, rolls |> List.skip 4
//    ((0,4), rolls1) ||> Seq.fold step, ((0,8), rolls2) ||> Seq.fold step)
// |> Seq.toList
// |> printfn "%A"
