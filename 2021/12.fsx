open System.IO
open System
open System.Collections.Generic

type Cave =
    | Start
    | End
    | Big of string
    | Small of string

let parseCave =
    function
    | "start" -> Start
    | "end" -> End
    | id when Seq.forall Char.IsUpper id -> Big id
    | id when Seq.forall Char.IsLower id -> Small id
    | id -> failwith (sprintf "Invalid cave identifier %A" id)

let parseLink (line: string) =
    match line.Split("-") with
    | [| a; b |] -> (parseCave a, parseCave b)
    | line -> failwith (sprintf "Invalid link line %A" line)

let links = File.ReadAllLines "12.input.txt" |> Seq.map parseLink

let memoize fn =
    let cache = new Dictionary<_,_>()
    (fun x ->
        match cache.TryGetValue x with
        | true, v -> v
        | false, _ ->
            let v = fn x
            cache.Add(x, v)
            v)

let getAdjacentCaves =
    memoize (fun n ->
        links
        |> Seq.fold
            (fun acc link ->
                match link with
                | a, b when a = n -> b::acc
                | a, b when b = n -> a::acc
                | _ -> acc)
            [])

let rec walk pathFinder walked  =
    match walked with
    | [] -> walk pathFinder [Start]
    | End::_ -> 1 // return [walked] for tracing
    | cave::_ ->
        let next = getAdjacentCaves cave |> List.filter (pathFinder walked)

        if Seq.isEmpty next
        then 0 // return [] for tracing
        else
            next
            |> List.map (fun n -> walk pathFinder (n :: walked))
            |> List.sum // return List.concat for tracing

let pathfinder1 walked n =
    match n with
    | Small _ when not (Seq.contains n walked) -> true
    | Big _ | End -> true
    | _ -> false

let canStillVisitTwice  =
    Seq.choose (function | Small n -> Some n | _ -> None)
    >> Seq.countBy id
    >> Seq.exists (fun (_, count) -> count >= 2)
    >> not

let pathfinder2 walked n =
    match n with
    | Small _ when (canStillVisitTwice walked) || not (Seq.contains n walked) -> true
    | Big _ | End -> true
    | _ -> false

printfn "Part 1: %A" (walk pathfinder1 [])
printfn "Part 2: %A" (walk pathfinder2 [])
