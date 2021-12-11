open System.IO

type OctopusState =
    | Flashed of int
    | Dormant of int

let octopuses =
    File.ReadAllLines "11.input.txt"
    |> Array.map (Seq.toArray >> Array.map (string >> int >> Dormant))
    |> array2D

let gridSize = Array2D.length1 octopuses

let inRange x = 0 <= x && x < gridSize

let getNeighbors (x, y) =
    [ (x + 1, y)
      (x - 1, y)
      (x, y + 1)
      (x, y - 1)
      (x + 1, y + 1)
      (x - 1, y - 1)
      (x + 1, y - 1)
      (x - 1, y + 1) ]
    |> Seq.filter (fun (x, y) -> (inRange x) && (inRange y))

let flatMap2D mapping a =
    seq { for x in [0..(Array2D.length1 a) - 1] do
              for y in [0..(Array2D.length2 a) - 1] do
                  yield mapping x y a[x,y] }

let increment (grid: OctopusState [,]) =
    grid |> Array2D.map (function
        | Dormant n -> Dormant (n + 1)
        | n -> n)

let flash (grid: OctopusState [,]) =
    let rec flashPoint (x, y) (grid: OctopusState [,]) =
        match grid[x, y] with
        | Dormant n when n > 9 ->
            let neighbors = getNeighbors (x, y)
            grid
            |> Array2D.mapi (fun x' y' n ->
                match n with
                | Dormant n when x' = x && y' = y -> Flashed n
                | Dormant n when Seq.contains (x', y') neighbors -> Dormant(n + 1)
                | _ -> n)
            |> (fun grid -> Seq.fold (fun acc curr -> flashPoint curr acc) grid neighbors)
        | _ -> grid

    grid
    |> flatMap2D (fun x y _ -> (x, y))
    |> Seq.fold (fun acc curr -> flashPoint curr acc) grid

let countFlashed (grid: OctopusState [,]) =
    grid
    |> flatMap2D (fun x y _ -> (x, y))
    |> Seq.map (fun (x, y) ->
                match grid[x, y] with
                | Flashed _ -> 1
                | _ -> 0)
    |> Seq.sum

let reconcile (grid: OctopusState [,]) =
    grid |> Array2D.map (function
        | Flashed _ -> Dormant 0
        | n -> n)

let step grid =
    let afterFlash = grid |> increment |> flash
    let flashCount = afterFlash |> countFlashed
    (afterFlash |> reconcile, flashCount)

let simulate n =
    [0..n-1]
    |> Seq.fold
        (fun (grid, total) _ ->
         let grid, stepFlashCount = step grid
         (grid, total + stepFlashCount))
        (octopuses, 0)
    |> (fun (_, totalFlashCount) -> totalFlashCount)

let synchronize() =
    let rec stepUntilSync (grid, flashes) steps =
        if flashes = pown gridSize 2
        then (grid, flashes, steps)
        else stepUntilSync (step grid) (steps + 1)
    stepUntilSync (octopuses, 0) 0
    |> (fun (_, _, steps) -> steps)

simulate 100 |> printfn "Part 1: %A"
synchronize() |> printfn "Part 2: %A"
