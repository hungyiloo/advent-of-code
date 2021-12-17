#r "nuget: FSharpx.Collections"
open FSharpx.Collections
open System.IO

let input =
  File.ReadAllLines "15.input.txt"
  |> Seq.map (Seq.map (string >> int))
  |> array2D

[<StructuralEquality>]
[<CustomComparison>]
type Node =
  Node of (int * int) * int with

  // CustomComparison is required for use with a PriorityQueue
  interface System.IComparable with
    member x.CompareTo y =
      match y with
      | :? Node as y ->
        match x, y with
        | Node(_, c1), Node(_, c2) -> c1.CompareTo(c2)
      | _ -> failwith "Can't compare a Node with anything other than another Node"

let dijkstra grid multiplier =
  let gridRows = Array2D.length1 grid
  let gridCols = Array2D.length2 grid
  let virtualGridRows = gridRows * multiplier
  let virtualGridCols = gridCols * multiplier
  let start = (0,0)
  let goal = (virtualGridRows - 1, virtualGridCols - 1)

  let inRangeX x = 0 <= x && x < virtualGridRows
  let inRangeY y = 0 <= y && y < virtualGridCols

  let visited =
    Array2D.init
      virtualGridRows
      virtualGridCols
      (fun x y -> (x,y) = start)

  let getNeighbors (x, y) =
    [ (x + 1, y)
      (x - 1, y)
      (x, y + 1)
      (x, y - 1) ]
    |> List.filter (fun (x, y) -> (inRangeX x) && (inRangeY y) && not visited.[x,y])

  let getCost (x, y) =
    let x' = x % gridRows
    let y' = y % gridCols
    ((grid.[x', y'] + (x / gridRows) + (y / gridCols) - 1) % 9) + 1

  let explore (pq: IPriorityQueue<Node>) =
    let (Node(bestCoord, cost)), pq = pq.Pop()
    (pq, getNeighbors bestCoord)
    ||> Seq.fold
      (fun pq (x, y) ->
        Array2D.set visited x y true
        pq.Insert(Node((x, y), cost + getCost(x,y))))

  let rec search (pq: IPriorityQueue<Node>) =
    // This can be replaced with a naive Seq.minBy if not using a PQ.
    // Not using a PriorityQueue results in poorer performance.
    let (Node(bestCoord, bestCost)) = pq.Peek()

    if bestCoord = goal
    then bestCost
    else search (explore pq)

  search (
    PriorityQueue
      .empty<Node>(false) // min heap
      .Insert(Node(start, 0))
  )

dijkstra input 1 |> printfn "Part 1: %A"
dijkstra input 5 |> printfn "Part 2: %A"
