open System.IO

type SnailfishNumber =
  | Literal of int
  | Exploded
  | Pair of SnailfishNumber * SnailfishNumber

let read s =
  s
  |> Seq.toArray
  |> Array.fold
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
  |> fst
  |> List.exactlyOne

let rec walk fLiteral fExploded fPair depth n =
  let recurse = walk fLiteral fExploded fPair (depth + 1)
  match n with
  | Literal x -> fLiteral depth x
  | Exploded -> fExploded depth
  | Pair(a, b) -> fPair depth (recurse a, recurse b)

// Having a dedicated "walkBack" function improves performance by a lot
let rec walkBack fLiteral fExploded fPair depth n =
  let recurse = walkBack fLiteral fExploded fPair (depth + 1)
  match n with
  | Literal x -> fLiteral depth x
  | Exploded -> fExploded depth
  | Pair(a, b) ->
    let b = recurse b
    let a = recurse a
    fPair depth (a, b)

let rec encode n =
  walk
    (fun _ x -> string x)
    (fun _ -> "0*")
    (fun _ (a,b) -> sprintf "[%s,%s]" a b)
    0
    n

let addToLiteral walker delta n =
  if delta = 0
  then n
  else
    let mutable delta = delta
    walker
      (fun _ x ->
        let result = Literal(x + delta)
        delta <- 0
        result)
      (fun _ -> Exploded)
      (fun _ (a,b) -> Pair(a, b))
      0
      n

let addToFirstLiteral = addToLiteral walk

let addToLastLiteral = addToLiteral walkBack

let explode n =
  let mutable exploded = false // only explode ONCE
  let result =
    walk
      (fun _ x -> Literal x, 0, 0)
      (fun _ -> Exploded, 0, 0)
      (fun depth ((a, aLeft, aRight), (b, bLeft, bRight)) ->
        if depth >= 4 && not exploded
        then
          exploded <- true
          match a, b with
          | Literal a, Literal b -> Exploded, a, b
          | _ -> failwith "Can't explode nested pairs"
        else
          Pair(a |> addToLastLiteral bLeft, b |> addToFirstLiteral aRight), aLeft, bRight)
      0
      n
    |> (fun (x, _, _) -> x)
    // reset all the Exploded numbers back to Literal 0
    |> walk
      (fun _ x -> Literal x)
      (fun _ -> Literal 0)
      (fun _ p -> Pair p)
      0
  (result, result <> n)

let split n =
  let mutable didSplit = false // only do ONE split
  let result =
    walk
      (fun _ x ->
        if x >= 10 && not didSplit then
          didSplit <- true
          Pair(Literal(x/2), Literal((x+1)/2))
        else Literal x)
      (fun _ -> Exploded)
      (fun _ (a,b) -> Pair(a,b))
      0
      n
  (result, result <> n)

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

let rec magnitude n =
  match n with
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
