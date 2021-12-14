open System.IO
open System

let template, rules =
  File.ReadLines "14.input.txt"
  |> Seq.fold
       (fun (template, rules) line ->
         match line.Split([| " -> " |], StringSplitOptions.RemoveEmptyEntries) with
         | [| left; right |] -> template, ((left.[0], left.[1]), right.[0]) :: rules
         | [| template |] -> template |> Seq.toArray, rules
         | _ -> template, rules)
       ([||], [])
  |> (fun (template, rules) ->
    (template
     |> Array.pairwise
     |> Seq.countBy id
     |> Seq.map (fun (p, c) -> (p, int64 c)),
     Map rules))

// combines partial counts by key distinctness, e.g.
// [ A, 3; B, 4; A, 5 ] => [ A, 8; B, 4 ]
let regroupCountBy (counts: seq<'a * int64>) =
  counts
  |> Seq.groupBy fst
  |> Seq.map (fun (key, partialCounts) -> key, Seq.sumBy snd partialCounts)

let step rules template =
  template
  |> Seq.map (fun ((a, b), count) ->
    match Map.tryFind (a, b) rules with
    // insertion means we create two new pairs of the same count as before
    | Some x -> [ (a, x), count; (x, b), count ]
    // otherwise we keep the old pair and its count
    | None -> [ (a, b), count ])
  |> Seq.concat
  |> regroupCountBy

let repeat n fn = Seq.replicate n fn |> Seq.reduce (>>)

let simulate n =
  (repeat n (step rules)) template
  // convert pair counts to character counts, being sure to dedupe
  |> Seq.mapi (fun i ((a, b), count) ->
    match i with
    | 0 -> [ a, count; b, count ]
    | _ -> [ b, count ])
  |> Seq.concat
  |> regroupCountBy
  |> (fun counts -> Seq.maxBy snd counts, Seq.minBy snd counts)
  |> (fun ((_, max), (_, min)) -> max - min)

simulate 10 |> printfn "Part 1: %A"
simulate 40 |> printfn "Part 2: %A"
