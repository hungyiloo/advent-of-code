open System.IO
open System

let template, rules =
  File.ReadLines "14.input.txt"
  |> Seq.fold
    (fun (template, rules) line ->
      match line.Split([|" -> "|], StringSplitOptions.RemoveEmptyEntries) with
      | [| left; right |] -> template, ((left.[0], left.[1]), right.[0]) :: rules
      | [| template |] -> template |> Seq.toArray, rules
      | _ -> template, rules)
    ([||], [])
  |> (fun (template, rules) -> template, rules |> Map)

let step rules template =
  template
  |> Array.pairwise
  |> Array.mapi
    (fun i (a, b) ->
      match i, Map.tryFind (a, b) rules with
      | 0, Some x -> [| a; x; b |]
      | _, Some x  -> [| x; b |]
      | 0, None -> [| b |]
      | _, None -> [| a; b |])
  |> Array.concat

let repeat n fn = Seq.replicate n fn |> Seq.reduce (>>)

let simulate n =
  (repeat n (step rules)) template
  |> Seq.countBy id
  |> (fun counts -> Seq.maxBy snd counts, Seq.minBy snd counts)
  |> (fun ((_, max), (_, min)) -> max - min)

simulate 10 |> printfn "Part 1: %A"
// simulate 40 |> printfn "Part 2: %A"
