open System.IO
open System

let data =
  File.ReadAllLines "03.input.txt" |> Seq.toList |> Seq.map Seq.toArray

let bits = data |> Seq.head |> Array.length

type Combinator = char array seq -> char array

let majority: Combinator =
  Seq.map (fun s -> Array.map (function '1' -> 1 | _ -> -1) s)
  >> Seq.reduce (fun acc curr -> Array.map2 (+) acc curr)
  >> Array.map (fun s -> if s >= 0 then '1' else '0')

let minority: Combinator =
  majority >> Array.map (function '0' -> '1' | _ -> '0')

let binCharsToInt (s: char array) = Convert.ToInt32(String s, 2)

[majority data; minority data]
|> Seq.map binCharsToInt
|> Seq.reduce (*)
|> printfn "Part 1: %A"

let rec search (remaining: char array seq) (bit: int) (combinator: Combinator) =
  if (Seq.length remaining) <= 1 || bit = bits
  then remaining
  else
    let sieve = (combinator remaining).[bit]
    search (Seq.filter (fun s -> s.[bit] = sieve) remaining) (bit + 1) combinator

let startSearch (combinator: Combinator) =
  (search data 0 combinator) |> Seq.head |> binCharsToInt

[startSearch majority; startSearch minority]
|> Seq.reduce (*)
|> printfn "Part 2: %A"
