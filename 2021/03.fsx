open System.IO
open System

let data =
    File.ReadAllLines "03.input.txt" |> Seq.toList

let bits = data |> Seq.head |> String.length

type Combinator = string list -> string

let majority: Combinator =
    Seq.fold
        (fun acc curr -> Array.mapi (fun i s -> s + (if curr[i] = '1' then 1 else -1)) acc)
        (Array.zeroCreate bits)
    >> Array.map (fun s -> if s >= 0 then '1' else '0')
    >> String

let minority: Combinator =
    majority
    >> Seq.toArray
    >> Array.map (fun c -> if c = '0' then '1' else '0')
    >> String

let binaryToInt = fun (s: string) -> Convert.ToInt32(s, 2)

[majority data; minority data]
|> Seq.map binaryToInt
|> Seq.reduce (*)
|> printfn "Part 1: %A"

let rec search =
    fun (remaining: string list) (bit: int) (combinator: Combinator) ->
        if ((List.length remaining) <= 1 || bit = bits)
        then remaining
        else
            let sieve = (combinator remaining)[bit]
            search
                (List.filter (fun num -> num[bit] = sieve) remaining)
                (bit + 1)
                combinator

let startSearch =
    fun (combinator: Combinator) -> (search data 0 combinator)[0] |> binaryToInt

[startSearch majority; startSearch minority]
|> Seq.reduce (*)
|> printfn "Part 2: %A"
