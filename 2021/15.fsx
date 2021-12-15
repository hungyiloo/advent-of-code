open System.IO

let input =
  File.ReadAllLines "15.input.txt"
  |> Seq.map (Seq.map (string >> int))
  |> array2D

type Node = Node of (int * int) * int

let dijkstra grid =
  let start = (0,0)
  let goal = ((Array2D.length1 grid) - 1, (Array2D.length2 grid) - 1)

  let inRangeX x = 0 <= x && x < Array2D.length1 grid
  let inRangeY y = 0 <= y && y < Array2D.length2 grid

  let getNeighbors (x, y) =
    [ (x + 1, y)
      (x - 1, y)
      (x, y + 1)
      (x, y - 1) ]
    |> List.filter (fun (x, y) -> (inRangeX x) && (inRangeY y))

  let best (nodes: Node list) =
    nodes
    |> Seq.map (function | Node (n, cost) -> n, if n = goal then cost else cost)
    |> Seq.minBy snd

  let expand nodes (visited: bool[,]) at =
    nodes
    |> Seq.map (fun node ->
      match node with
      | Node (n, cost) when n = at ->
        let neighbors = getNeighbors n |> List.filter (fun (x, y) -> not visited.[x,y])
        match neighbors with
        | [] -> []
        | newChildren ->
          newChildren |> List.iter (fun (x, y) -> Array2D.set visited x y true)
          newChildren |> List.map (fun (x, y) -> Node((x, y), cost + grid.[x, y]))
      | _ -> [node])
    |> List.concat

  let visited = (Array2D.mapi (fun x y _ -> if (x,y) = start then true else false) grid)

  let rec search nodes =
    let bestNode, bestCost = best nodes
    if bestNode = goal
    then bestCost
    else
      let newNodes = expand nodes visited bestNode
      search newNodes

  search [Node(start, 0)]

#time "on"
dijkstra input |> printfn "Part 1: %A"
#time "off"
