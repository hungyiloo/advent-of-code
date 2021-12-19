open System.IO

type SnailfishNumber =
  | Literal of int
  | Exploded
  | Pair of SnailfishNumber * SnailfishNumber

let read =
  Seq.toArray
  >> Array.fold
    (fun acc c ->
      let stack, cache = acc
      match c with
      | '[' -> stack, cache
      | ',' ->
        let stack =
          match cache with
          | "" -> stack
          | s -> Literal(int s)::stack
        stack, ""
      | ']' ->
        let stack =
          match cache with
          | "" -> stack
          | s -> Literal(int s)::stack
        match stack with
        | a::b::stack -> Pair(b, a)::stack, ""
        | _ -> failwith "Not enough items in stack to close a pair!"
      | n -> stack, cache + (string n))
    ([], "")
  >> fst
  >> List.exactlyOne

let rec encode =
  function
  | Literal x -> string x
  | Exploded -> "0*"
  | Pair(a,b) -> sprintf "[%s, %s]" (encode a) (encode b)

let rec addToLeftmostLiteral delta =
  function
  | Literal x -> Literal (x + delta)
  | Pair(a, b) -> Pair(addToLeftmostLiteral delta a, b)
  | q -> q

let rec addToRightmostLiteral delta =
  function
  | Literal x -> Literal (x + delta)
  | Pair(a, b) -> Pair(a, addToRightmostLiteral delta b)
  | q -> q

let rec resetExploded =
  function
  | Exploded -> Literal 0
  | Pair(a,b) -> Pair(resetExploded a, resetExploded b)
  | q -> q

let explode n =
  let mutable exploded = false // only explode ONCE
  let rec recurse depth (n, left, right) =
    match n with
    | Literal _ -> n, 0, 0
    | Exploded -> n, 0, 0
    | Pair(a, b) when depth >= 4 && not exploded ->
      exploded <- true
      match a, b with
      | Literal a, Literal b -> Exploded, a, b
      | _ -> failwith "Can't explode nested pairs"
    | Pair(a, b) ->
      let a, aLeft, aRight = recurse (depth + 1) (a, left, right)
      let b, bLeft, bRight = recurse (depth + 1) (b, left, right)
      Pair(a |> addToRightmostLiteral bLeft, b |> addToLeftmostLiteral aRight), aLeft, bRight

  recurse 0 (n, 0, 0) |> (fun (x, _, _) -> x) |> resetExploded,
  exploded

let split n =
  let mutable didSplit = false // only do ONE split
  let rec recurse n =
    match n with
    | Literal x when x >= 10 && not didSplit ->
      didSplit <- true
      Pair(Literal(x/2), Literal((x+1)/2))
    | Pair(a, b) -> Pair(recurse a, recurse b)
    | _ -> n
  (recurse n, didSplit)

let reduce n =
  let mutable keepReducing = true
  let mutable result = n
  while keepReducing do
    // this very specific order of operations is EXTREMELY important
    // do NOT try to be greedy and do multiple explosions or splits in one step
    // do NOT try to split after an explosion unless we're sure there are no other explosions possible
    let nextResult, didExplode = explode result
    let nextResult, didSplit = if didExplode then nextResult, false else split nextResult
    keepReducing <- didExplode || didSplit
    result <- nextResult
  result

let add n1 n2 = Pair(n1, n2) |> reduce

let rec magnitude =
  function
  | Literal x -> x
  | Pair (a, b) -> (3 * (magnitude a)) + (2 * (magnitude b))
  | Exploded -> 0

let inline (++) xs ys = xs |> List.collect (fun x -> ys |> List.map (fun y -> x, y))

let numbers = File.ReadAllLines "18.input.txt" |> Seq.map read |> Seq.toList

numbers
|> Seq.reduce add
|> magnitude
|> printfn "Part 1: %d"

numbers ++ numbers
|> Seq.filter (fun (a, b) -> a <> b) // ignore pairs of the same number
|> Seq.map (fun (a, b) -> add a b |> magnitude)
|> Seq.max
|> printfn "Part 2: %d"
