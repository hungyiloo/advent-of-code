open System.IO

let (|Forward|Up|Down|) (line: string) =
    match line.Split(" ") with
    | [| "forward"; x |] -> Forward (int x)
    | [| "up"; x |] -> Up (int x)
    | [| "down"; x |] -> Down (int x)
    | _ -> failwith (sprintf "Invalid line %s" line)

let vectors = File.ReadLines "02.input.txt"

vectors
|> Seq.fold
    (fun (position, depth) vector ->
        match vector with
        | Forward x -> position + x, depth
        | Down x -> position, depth + x
        | Up x -> position, depth - x)
    (0, 0)
|> fun (position, depth) -> position * depth
|> printfn "Part 1: %d"

vectors
|> Seq.fold
    (fun (position, depth, aim) vector ->
        match vector with
        | Forward x -> position + x, depth + aim * x, aim
        | Down x -> position, depth, aim + x
        | Up x -> position, depth, aim - x)
    (0, 0, 0)
|> fun (position, depth, _) -> position * depth
|> printfn "Part 2: %d"
