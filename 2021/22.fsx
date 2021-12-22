open System
open System.IO

let (|SplitMulti|) (separators: string seq) (s: string) =
  match s.Trim().Split(separators |> Seq.toArray, StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList

let clamp (min, max) (a, b) =
  (if a < min then min else a),
  (if b > max then max else b)

let mark m ((x1, x2), (y1, y2), (z1, z2), value) =
  let coordinates =
    seq { for x in [x1..x2] do
            for y in [y1..y2] do
              for z in [z1..z2] do
                yield (x, y, z) }
  (m, coordinates) ||> Seq.fold (fun m coord -> Map.add coord value m)

let parseRange rangeString =
  match rangeString with
  | SplitMulti [ "="; ".." ] [ _; v1; v2 ] -> (int v1, int v2)
  | e -> failwith (sprintf "Invalid range string %A" e)

let part1() =
  let ranges =
    File.ReadAllLines "22.input.txt"
    |> Seq.map
      (fun line ->
        match line with
        | SplitMulti [ " "; "," ] [ value; xRange; yRange; zRange ] ->
          parseRange xRange |> clamp (-50, 50),
          parseRange yRange |> clamp (-50, 50),
          parseRange zRange |> clamp (-50, 50),
          value = "on"
        | e -> failwith (sprintf "Invalid input format %A" e))

  ranges
  |> Seq.fold mark Map.empty
  |> Map.values
  |> Seq.filter id
  |> Seq.length
  |> printfn "Part 1: %d"

part1()
