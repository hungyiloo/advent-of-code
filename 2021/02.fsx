open System.IO

type Direction =
    | Forward
    | Up
    | Down

let parseDirection =
    function
    | "forward" -> Forward
    | "up" -> Up
    | "down" -> Down
    | unknown -> failwith (sprintf "Unrecognized direction %s" unknown)

let vectors =
    File.ReadLines "02.input.txt"
    |> Seq.map (fun l -> l.Split())
    |> Seq.map (function
        | [| p1; p2 |] -> (parseDirection p1, int p2)
        | _ -> failwith (sprintf "Invalid line format"))

vectors
|> Seq.fold
    (fun (position, depth) movement ->
        match movement with
        | (Forward, x) -> (position + x, depth)
        | (Down, x) -> (position, depth + x)
        | (Up, x) -> (position, depth - x))
    (0, 0)
|> fun (position, depth) -> position * depth
|> printfn "Part 1: %d"

vectors
|> Seq.fold
    (fun (position, depth, aim) movement ->
        match movement with
        | (Forward, x) -> (position + x, depth + aim * x, aim)
        | (Down, x) -> (position, depth, aim + x)
        | (Up, x) -> (position, depth, aim - x))
    (0, 0, 0)
|> fun (position, depth, _) -> position * depth
|> printfn "Part 2: %d"
