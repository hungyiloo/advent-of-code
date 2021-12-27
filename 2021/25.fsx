open System.IO
open System

type Cucumber = Right | Down | Empty

let grid =
  File.ReadAllLines "25.input.txt"
  |> array2D
  |> Array2D.map
    (fun c ->
      match c with
      | '>' -> Right
      | 'v' -> Down
      | _ -> Empty)

// This optional function isn't involved in the solution
let visualize grid =
  let rows = Array2D.length1 grid
  [0..(rows - 1)]
  |> List.map (fun row -> grid.[row,*] |> Array.map (function | Empty -> '.' | Down -> 'v' | Right -> '>') |> String)
  |> List.iter (printfn "%s")

let step grid =
  let rows = Array2D.length1 grid
  let cols = Array2D.length2 grid
  let mutable didMove = false

  let tryMove cucumber fromRow fromCol (fromGrid: Cucumber[,]) targetRow targetCol targetGrid =
    match fromGrid.[targetRow, targetCol] with
    | Empty ->
      didMove <- true
      Array2D.set targetGrid fromRow fromCol Empty
      Array2D.set targetGrid targetRow targetCol cucumber
    | _ -> ()

  let nextGrid = grid.[*,*]
  grid |> Array2D.iteri
    (fun row col cucumber ->
      match grid.[row,col] with
      | Right -> tryMove cucumber row col grid row ((col + 1) % cols) nextGrid
      | _ -> ())

  let grid = nextGrid
  let nextGrid = grid.[*,*]
  grid |> Array2D.iteri
    (fun row col cucumber ->
      match grid.[row,col] with
      | Down -> tryMove cucumber row col grid ((row + 1) % rows) col nextGrid
      | _ -> ())

  nextGrid, didMove

let rec stepUntilStop grid numSteps =
  let nextGrid, didMove = step grid
  if didMove
  then stepUntilStop nextGrid (numSteps + 1)
  else nextGrid, numSteps

stepUntilStop grid 1
|> (fun (finalGrid, steps) -> visualize finalGrid; steps)
|> printfn "Part 1: %d"
