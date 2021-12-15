open System.IO

let input =
  File.ReadAllLines "15.input.txt"
  |> Seq.map (Seq.map (string >> int))
  |> array2D

type Node = Node of (int * int) * int

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
      (fun x y -> if (x,y) = start then true else false)

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

  let best (nodes: Node list) =
    nodes
    |> Seq.map (function | Node (n, cost) -> n, if n = goal then cost else cost)
    |> Seq.minBy snd

  let expand nodes at =
    ([], nodes)
    ||> Seq.fold
      (fun acc node ->
        match node with
        | Node (n, cost) when n = at ->
          match getNeighbors n with
          | [] -> acc
          | children ->
            (acc, children)
            ||> Seq.fold
              (fun acc (x, y) ->
                Array2D.set visited x y true
                Node((x, y), cost + getCost(x,y))::acc)
        | _ -> node::acc)

  let rec search nodes =
    let bestNode, bestCost = best nodes
    if bestNode = goal
    then bestCost
    else
      search (expand nodes bestNode)

  search [Node(start, 0)]

dijkstra input 1 |> printfn "Part 1: %A"
#time "on"
dijkstra input 5 |> printfn "Part 2: %A"
#time "off"
