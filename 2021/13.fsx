open System.IO
open System

type Line =
    | Vertical of int
    | Horizontal of int

let lines = File.ReadAllLines "13.input.txt"

let dots =
    lines
    |> Seq.choose
        (fun line ->
            match line.Split(',') with
            | [| a; b |] -> Some(int a, int b)
            | _ -> None)

let folds =
    lines
    |> Seq.choose
        (fun line ->
            match line.Split('=') with
            | [| "fold along x"; a |] -> a |> int |> Vertical |> Some
            | [| "fold along y"; a |] -> a |> int |> Horizontal |> Some
            | _ -> None)

let origami dots folds =
    folds
    |> Seq.fold
        (fun acc curr ->
            let foldOperation =
                match curr with
                 | Horizontal dividerY ->
                    (fun (x, y) -> x, (if y > dividerY then 2*dividerY - y else y))
                 | Vertical dividerX ->
                    (fun (x, y) -> (if x > dividerX then 2*dividerX - x else x), y)
            Seq.map foldOperation acc)
        dots
    |> Seq.distinct

let plot dots =
    let maxX = dots |> Seq.map fst |> Seq.max
    let maxY = dots |> Seq.map snd |> Seq.max
    let output = Array2D.create (maxX + 1) (maxY + 1) ' '
    dots |> Seq.iter (fun (x, y) -> Array2D.set output x y '█')
    [0..maxY]
    |> List.map (fun y -> String.Join("", output[*, y]))
    |> (fun rows -> String.Join("\n", rows))

origami dots (Seq.take 1 folds)
|> Seq.length
|> printfn "Part 1: %A"

origami dots folds
|> plot
|> printfn "Part 2:\n%s"
