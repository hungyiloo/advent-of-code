open System.IO
open System

let data =
    File.ReadAllLines "03.input.txt" |> Seq.toList

let bits = data |> Seq.head |> String.length

type Combinator = string seq -> string

let majority: Combinator =
    Seq.map (fun s -> Array.map (function '1' -> 1 | _ -> -1) (Seq.toArray s))
    >> Seq.reduce (fun acc curr -> Array.map2 (+) acc curr)
    >> Array.map (fun s -> if s >= 0 then '1' else '0')
    >> String

let minority: Combinator =
    majority
    >> Seq.toArray
    >> Array.map (fun c -> if c = '0' then '1' else '0')
    >> String

let binaryToInt (s: string) = Convert.ToInt32(s, 2)

[majority data; minority data]
|> Seq.map binaryToInt
|> Seq.reduce (*)
|> printfn "Part 1: %A"

let rec search (remaining: string seq) (bit: int) (combinator: Combinator) =
    if (Seq.length remaining) <= 1 || bit = bits
    then remaining
    else
        let sieve = (combinator remaining)[bit]
        search (Seq.filter (fun s -> s[bit] = sieve) remaining) (bit + 1) combinator

let startSearch (combinator: Combinator) =
    (search data 0 combinator) |> Seq.head |> binaryToInt

[startSearch majority; startSearch minority]
|> Seq.reduce (*)
|> printfn "Part 2: %A"
