open System.IO

File.ReadLines "../../input/2021/01.txt"
|> Seq.map int
|> Seq.pairwise
|> Seq.filter (fun (x, y) -> x < y)
|> Seq.length
|> printfn "Part 1: %d"

File.ReadLines "../../input/2021/01.txt"
|> Seq.map int
|> Seq.windowed 3
|> Seq.map Seq.sum
|> Seq.pairwise
|> Seq.filter (fun (x, y) -> x < y)
|> Seq.length
|> printfn "Part 2: %d"
