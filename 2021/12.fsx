#load "../lib/Memoization.fsx"

open System.IO
open System
open Memoization

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
    match line.Split('-') with
    | [| a; b |] -> (parseCave a, parseCave b)
    | line -> failwith (sprintf "Invalid link line %A" line)

let links = File.ReadAllLines "12.input.txt" |> Seq.map parseLink

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

let rec walk pathfinder walked n  =
    let walked = n :: walked
    match walked with
    | [] -> walk pathfinder [] Start
    | End::_ -> 1 // return [walked] for tracing
    | cave::_ ->
        let next = getAdjacentCaves cave |> List.filter (pathfinder walked)
        if Seq.isEmpty next
        then 0 // return [] for tracing
        else
            next
            |> List.map (walk pathfinder walked)
            |> List.sum // return List.concat for tracing

let pathfinder1 walked n =
    match n with
    | Small _ -> not (Seq.contains n walked)
    | Big _ | End -> true
    | _ -> false

let canStillVisitTwice walked =
    walked
    |> Seq.choose (function | Small n -> Some n | _ -> None)
    |> Seq.countBy id
    |> Seq.exists (fun (_, count) -> count >= 2)
    |> not

let pathfinder2 walked n =
    match n with
    | Small _ -> canStillVisitTwice walked || not (Seq.contains n walked)
    | Big _ | End -> true
    | _ -> false

printfn "Part 1: %A" (walk pathfinder1 [] Start)
printfn "Part 2: %A" (walk pathfinder2 [] Start)
