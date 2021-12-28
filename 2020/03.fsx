open System.IO

let grid = File.ReadAllLines "03.input.txt" |> array2D

let traceSlope (dx, dy) grid =
  let rows = Array2D.length1 grid
  let cols = Array2D.length2 grid
  seq { for i in [0..((rows - 1) / dx)] do yield grid.[i * dx, (i * dy) % cols] }

let countTrees grid slope =
  grid
  |> traceSlope slope
  |> Seq.map (fun c -> if c = '#' then 1L else 0L)
  |> Seq.sum

countTrees grid (1, 3) |> printfn "Part 1: %d"

[ (1, 1); (1, 3); (1, 5); (1, 7); (2, 1) ]
|> Seq.map (countTrees grid)
|> Seq.toList
|> Seq.reduce (*)
|> printfn "Part 2: %d"
