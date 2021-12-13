open System.IO
open System

type Fold =
    | Vertical of int
    | Horizontal of int

let (|SplitLine|_|) (separator: char) (line: string) =
    match line.Split(separator) with
    | [| left; right |] -> Some (left, right)
    | _ -> None

let dots, folds =
    File.ReadLines "13.input.txt"
    |> Seq.fold
        (fun (dots, folds) line ->
            match line with
            | SplitLine ',' (x, y) -> (int x, int y)::dots, folds
            | SplitLine '=' (direction, position) ->
                match direction with
                | "fold along x" -> dots, Vertical (int position) :: folds
                | "fold along y" -> dots, Horizontal (int position) :: folds
                | _ -> dots,folds
            | _ -> dots, folds)
        ([], [])
    |> (fun (dots, folds) -> dots, folds |> List.rev)

let origami dots folds =
    folds
    |> Seq.fold
        (fun acc curr ->
            let foldOperation =
                match curr with
                 | Horizontal lineAtY -> (fun (x, y) -> x, (if y > lineAtY then 2*lineAtY - y else y))
                 | Vertical lineAtX -> (fun (x, y) -> (if x > lineAtX then 2*lineAtX - x else x), y)
            Seq.map foldOperation acc)
        dots
    |> Seq.distinct

let plot dots =
    let maxX, maxY =
        dots
        |> Seq.fold
            (fun (X, Y) (x, y) -> Seq.max [X; x], Seq.max [Y; y])
            (0, 0)
    let dotSet = Set.ofSeq dots
    let output =
        Array2D.init
            (maxX + 1)
            (maxY + 1)
            (fun x y -> if Set.contains (x, y) dotSet then "██" else "  ")
    [0..maxY]
    |> List.map (fun y -> String.Join("", output.[*,y]))
    |> (fun rows -> String.Join("\n", rows))

origami dots (Seq.take 1 folds)
|> Seq.length
|> printfn "Part 1: %A"

origami dots folds
|> plot
|> printfn "Part 2:\n%s"
