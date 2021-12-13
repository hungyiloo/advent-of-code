open System.IO
open System

let parseDot (line: string) =
    match line.Split(',') with
    | [| a; b |] -> Some(int a, int b)
    | _ -> None

type Line =
    | Vertical of int
    | Horizontal of int

let parseLine (line: string) =
    match line.Split('=') with
    | [| "fold along x"; a |] -> a |> int |> Vertical |> Some
    | [| "fold along y"; a |] -> a |> int |> Horizontal |> Some
    | _ -> None

let dots =
    File.ReadAllLines "13.input.txt"
    |> Seq.choose parseDot

let lines =
    File.ReadAllLines "13.input.txt"
    |> Seq.choose parseLine

let origami dots lines =
    lines
    |> Seq.fold
        (fun acc curr ->
            Seq.map
                (match curr with
                 | Horizontal dividerY -> (fun (x, y) -> x, (if y > dividerY then 2*dividerY - y else y))
                 | Vertical dividerX -> (fun (x, y) -> (if x > dividerX then 2*dividerX - x else x), y))
                acc)
        dots
    |> Seq.distinct

let plot dots =
    let maxX = dots |> Seq.map fst |> Seq.max
    let maxY = dots |> Seq.map snd |> Seq.max
    let output = Array2D.create (maxX + 1) (maxY + 1) ' '
    dots |> Seq.iter (fun (x, y) -> Array2D.set output x y '█')
    [0..maxY]
    |> List.map (fun y -> String.Join("", output[*, y]))
    |> (fun lines -> String.Join("\n", lines))

origami dots (Seq.take 1 lines)
|> Seq.length
|> printfn "Part 1: %A"

origami dots lines
|> plot
|> printfn "Part 2:\n%s"
