open System.IO
open System

type Cave =
    | Start
    | End
    | Big of string
    | Small of string

type Link = Cave * Cave

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

let rec walk pathFinder walked cave =
    match cave with
    | End -> 1 // return [walked] for tracing
    | _ ->
        let next =
            links
            |> Seq.fold
                (fun acc l ->
                    let maybeWalk n =
                        match pathFinder walked n with
                        | Some n -> n :: acc
                        | None -> acc
                    match l with
                    | a, b when a = cave -> maybeWalk b
                    | a, b when b = cave -> maybeWalk a
                    | _ -> acc)
                []
            |> List.distinct

        match next with
        | [] -> 0 // return [] for tracing
        | _ ->
            next
            |> List.map (fun n -> walk pathFinder (n :: walked) n)
            |> List.sum // return List.concat for tracing

let pathfinder1 walked n =
    match n with
    | Small _ when not (Seq.contains n walked) -> Some n
    | Big _ | End -> Some n
    | _ -> None

let canVisitTwice walked =
    walked
    |> Seq.countBy (function | Small n -> Some n | _ -> None)
    |> Seq.exists (fun (id, count) -> match id with | Some _ -> count >= 2 | None -> false)
    |> not

let pathfinder2 walked n =
    match n with
    | Small _ when (canVisitTwice walked) || not (Seq.contains n walked) -> Some n
    | Big _ | End -> Some n
    | _ -> None

printfn "Part 1: %A" (walk pathfinder1 [] Start)
printfn "Part 2: %A" (walk pathfinder2 [] Start)