#load "../lib/Parsing.fsx"
open Parsing
open System.IO

let parseTarget =
  function
  | Split ": " [ "target area"; coords ] ->
    match coords with
    | Split ", " [ xRange; yRange ] ->
      let x1, x2 =
        match xRange with
        | SplitMulti ["x="; ".."] [ x1; x2 ] -> int x1, int x2
        | _ -> failwith "invalid input"
      let y1, y2 =
        match yRange with
        | SplitMulti ["y="; ".."] [ y1; y2 ] -> int y1, int y2
        | _ -> failwith "invalid input"
      x1, x2, y1, y2
    | _ -> failwith "invalid input"
  | _ -> failwith "invalid input"

let inTarget target point =
  let x, y = point
  let x1, x2, y1, y2 = target
  x1 <= x && x <= x2 && y1 <= y && y <= y2

let overshoot target point =
  let x, y = point
  let _, x2, y1, _ = target
  x > x2 || y < y1

let step velocity point =
  let vx, vy = velocity
  let x, y = point
  ((if vx > 0 then vx - 1 else 0), vy - 1),
  (x + vx, y + vy)

let simulate velocity target =
  let checkTarget = inTarget target
  let checkOvershoot = overshoot target
  let rec search (path, velocity) =
    let point = Seq.head path
    if (checkTarget point) || (checkOvershoot point)
    then path, velocity
    else
      let nextVelocity, nextPoint = step velocity point
      search (nextPoint::path, nextVelocity)

  let path,_  = search ([(0, 0)], velocity)

  match path with
  | point::_ when checkTarget point -> Some path
  | _ -> None

let inline (++) xs ys = xs |> List.collect (fun x -> ys |> List.map (fun y -> x, y))

let triangularRoot n =
  n |> float |> (*) 8.0 |> (+) 1.0 |> sqrt |> (+) -1.0 |> (*) 0.5 |> int

let target =
  // "target area: x=20..30, y=-10..-5"
  File.ReadAllText "../../input/2021/17.txt"
  |> parseTarget

// I really can't be bothered doing a mathematical analysis here to reduce the search space
// So just putting in some best guesses for reasonable space to search for each part
let _, x2, y1, _ = target

[(triangularRoot x2)] ++ [y1..(abs y1)]
|> List.choose
  (fun (vx, vy) ->
    match simulate (vx, vy) target with
    | Some path -> Some (path |> Seq.maxBy snd |> snd)
    | _ -> None)
|> Seq.max
|> printfn "Part 1: %A"

[0..x2] ++ [y1..(abs y1)]
|> List.choose (fun (vx, vy) -> simulate (vx, vy) target)
|> List.length
|> printfn "Part 2: %A"
