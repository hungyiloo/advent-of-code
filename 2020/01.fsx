open System.IO

let numbers = File.ReadAllLines "01.input.txt" |> Seq.map int

numbers
|> Seq.collect (fun n1 -> numbers |> Seq.map (fun n2 -> n1, n2))
|> Seq.find (fun (n1, n2) -> n1 + n2 = 2020)
|> (fun (n1, n2) -> n1 * n2)
|> printfn "Part 1: %A"

numbers
|> Seq.collect (fun n1 -> numbers |> Seq.collect (fun n2 -> numbers |> Seq.map (fun n3 -> n1, n2, n3)))
|> Seq.find (fun (n1, n2, n3) -> n1 + n2 + n3 = 2020)
|> (fun (n1, n2, n3) -> n1 * n2 * n3)
|> printfn "Part 2: %A"
