#load "../lib/Parsing.fsx"
open Parsing
open System.IO

let records =
  File.ReadAllLines "../../input/2020/02.txt"
  |> Seq.map
    (fun line ->
    match line with
    | Split ": " [ policy; password ] ->
      match policy with
      | SplitMulti [ " "; "-" ] [ x; y; letter ] -> int x, int y, letter, password
      | _ -> failwith "invalid password policy"
    | _ -> failwith "invalid input line format")

let isValidPart1 (min, max, letter, password) =
  let letter = letter |> Seq.head
  let count = password |> Seq.map (fun c -> if c = letter then 1 else 0) |> Seq.sum
  min <= count && count <= max

let isValidPart2 (pos1, pos2, letter, (password: string)) =
  let letter = letter |> Seq.head
  // logical XOR
  (password.[pos1 - 1] = letter) <> (password.[pos2 - 1] = letter)

records |> Seq.filter isValidPart1 |> Seq.length |> printfn "Part 1: %A"
records |> Seq.filter isValidPart2 |> Seq.length |> printfn "Part 2: %A"
