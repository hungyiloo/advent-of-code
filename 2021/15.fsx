open System.IO

let input =
  File.ReadAllLines "15.input.txt"
  |> Seq.map (Seq.map (string >> int))
  |> array2D

type Node = Node of (int * int) * int

let insertByCost (pq: Node list) (newNode: Node) =
  let (Node(_, newNodeCost)) = newNode
  let index = List.tryFindIndex (fun (Node(_, cost)) -> cost > newNodeCost) pq
  match index with
  | Some i -> List.insertAt i newNode pq
  | None -> List.insertAt (List.length pq) newNode pq

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

  let explore (pq: Node list) =
    let (Node(bestCoord, cost)), pq =
      match pq with
      | head::pq -> head, pq
      | _ -> failwith "Can't explore an empty queue"
    (pq, getNeighbors bestCoord)
    ||> Seq.fold
      (fun pq (x, y) ->
        Array2D.set visited x y true
        insertByCost pq (Node((x, y), cost + getCost(x,y))))

  let rec search (pq: Node list) =
    let (Node(bestCoord, bestCost)) = List.head pq

    if bestCoord = goal
    then bestCost
    else search (explore pq)

  search [Node(start, 0)]

dijkstra input 1 |> printfn "Part 1: %A"
dijkstra input 5 |> printfn "Part 2: %A"
