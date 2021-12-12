open System.IO
open System

type Cave =
    | Start
    | End
    | Big of string
    | Small of string

type Link = Cave * Cave

let parseCave = function
    | "start" -> Start
    | "end" -> End
    | id when Seq.forall Char.IsUpper id -> Big id
    | id when Seq.forall Char.IsLower id -> Small id
    | id -> failwith (sprintf "Invalid cave identifier %A" id)

let parseLink (line: string) =
    match line.Split("-") with
    | [|a; b|] -> (parseCave a, parseCave b)
    | line -> failwith (sprintf "Invalid link line %A" line)

let links = File.ReadAllLines "12.input.txt" |> Seq.map parseLink

let rec walk (walked: Cave list) cave =
    let next =
        links
        |> Seq.fold
            (fun acc l ->
            match l with
            | a, b when a = cave ->
                match b with
                | Small _ when not (Seq.contains b walked) -> b::acc
                | Big _ | End -> b::acc
                | _ -> acc
            | a, b when b = cave ->
                match a with
                | Small _ when not (Seq.contains a walked) -> a::acc
                | Big _ | End -> a::acc
                | _ -> acc
            | _ -> acc)
            []
    match next, cave with
    | _, End -> [cave::walked]
    | [], _ -> []
    | _ -> next |> List.map (fun n -> walk (cave::walked) n) |> List.concat

printfn "Part 1: %A" (walk [] Start |> Seq.length)
