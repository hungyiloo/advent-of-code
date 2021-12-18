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

let rec walk fLiteral fExploded fPair ancestors n =
  let recurse = walk fLiteral fExploded fPair (n::ancestors)
  match n with
  | Literal x -> fLiteral ancestors x
  | Exploded -> fExploded ancestors
  | Pair(a, b) -> fPair ancestors (recurse a, recurse b)

let rec walkBack fLiteral fExploded fPair ancestors n =
  let recurse = walkBack fLiteral fExploded fPair (n::ancestors)
  match n with
  | Literal x -> fLiteral ancestors x
  | Exploded -> fExploded ancestors
  | Pair(a, b) ->
    let b = recurse b
    let a = recurse a
    fPair ancestors (a, b)

let rec encode n =
  walk
    (fun _ x -> string x)
    (fun _ -> "0*")
    (fun _ (a,b) -> sprintf "[%s,%s]" a b)
    []
    n

let addToLiteral walker delta n =
  let mutable delta = delta
  walker
    (fun _ x ->
     let result = Literal(x + delta)
     delta <- 0
     result)
    (fun _ -> Exploded)
    (fun _ (a,b) -> Pair(a, b))
    []
    n

let addToFirstLiteral = addToLiteral walk

let addToLastLiteral = addToLiteral walkBack

let explode n =
  let mutable exploded = false
  let result =
    walk
      (fun _ x -> Literal x, 0, 0)
      (fun _ -> Exploded, 0, 0)
      (fun ancestors ((a, aLeft, aRight), (b, bLeft, bRight)) ->
        if (List.length ancestors) >= 4 && not exploded
        then
          exploded <- true
          match a, b with
          | Literal a, Literal b -> Exploded, a, b
          | _ -> failwith "Can't explode nested pairs"
        else
          match a, b with
          | Literal a, Literal b -> Pair(Literal(a + aLeft + bLeft), Literal(b + aRight + bRight)), 0, 0
          | Literal a, _ -> Pair(Literal(a + aLeft + bLeft), b), 0, aRight + bRight
          | _, Literal b -> Pair(a, Literal(b + aRight + bRight)), aLeft + bLeft, 0
          | _ -> Pair(a |> addToLastLiteral bLeft, b |> addToFirstLiteral aRight), aLeft, bRight)
      []
      n
    |> (fun (x, _, _) -> x)
    |> walk
      (fun _ x -> Literal x)
      (fun _ -> Literal 0)
      (fun _ p -> Pair p)
      []
  (result, result <> n)

let split n =
  let mutable didSplit = false
  let result =
    walk
      (fun _ x ->
        if x >= 10 && not didSplit then
          didSplit <- true
          Pair(Literal(x/2), Literal((x+1)/2))
        else Literal x)
      (fun _ -> Exploded)
      (fun _ (a,b) -> Pair(a,b))
      []
      n
  (result, result <> n)

let reduce n =
  let mutable keepReducing = true
  let mutable result = n
  while keepReducing do
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
|> Seq.map (fun (a, b) -> add a b |> magnitude)
|> Seq.max
|> printfn "Part 2: %d"
