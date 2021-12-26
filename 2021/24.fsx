open System.IO
open System

type Operator = int -> int -> int
type Operand = Register of string | Literal of int
type Instruction = Input of string | Operation of Operator * string * Operand
type State = { registers: Map<string, int>; stack: int list }

let (|Int|_|) (x: string) =
  match Int32.TryParse x with
  | true, i -> Some i
  | _ -> None

let (|Op|) (x: string) =
  match x with
  | "add" -> (+)
  | "mul" -> (*)
  | "div" -> (/)
  | "mod" -> (%)
  | "eql" -> (fun a b -> if a = b then 1 else 0)
  | _ -> failwith "invalid op"

let getZ state = match Map.tryFind "z" state.registers with | Some v -> v | None -> 0

let reduce state instruction =
  match instruction, state.stack with
  | Input reg, pop::tail -> { registers = Map.add reg pop state.registers; stack = tail }
  | Operation(operator, reg, operand), stack ->
    let left = match Map.tryFind reg state.registers with | Some v -> v | None -> 0
    let right =
      match operand with
      | Literal i -> i
      | Register r -> match Map.tryFind r state.registers with | Some v -> v | None -> 0
    let result = operator left right
    let nextState = { registers = Map.add reg result state.registers; stack = stack }
    nextState
  | _ -> failwith "illegal instruction"

let instructions =
  File.ReadAllLines "24.input.txt"
  |> Seq.map
    (fun (line: string) ->
      match line.Split([| ' ' |]) with
      | [| Op op; reg; Int i |] -> Operation(op, reg, Literal i)
      | [| Op op; reg1; reg2 |] -> Operation(op, reg1, Register reg2)
      | [| "inp"; reg1 |] -> Input reg1
      | _ -> failwith "invalid line")

let compute input = instructions |> Seq.fold reduce { registers = Map.empty; stack = input } |> getZ

let scoreForMax (input: int list) =
  if compute input = 0
  then 99999999999999L - (input |> Seq.map string |> String.concat "" |> int64)
  else 99999999999999L

let scoreForMin (input: int list) =
  if compute input = 0
  then input |> Seq.map string |> String.concat "" |> int64
  else 99999999999999L

let mutate =
  let r = System.Random()
  (fun input ->
    input
    |> List.map
      (fun digit ->
      let doMutate = r.Next(0, 5) = 1
      if doMutate
      then
        let mutation = r.Next(1, 9)
        (((digit - 1) + mutation) % 9) + 1
      else digit))

let evolve sorter (inputs: int list list) =
  List.replicate 10 inputs
  |> List.concat
  |> List.map mutate
  |> List.append inputs
  |> sorter
  |> List.take 3

let evolveForValidity = evolve (List.sortBy (fun input -> compute input |> abs))
let evolveForMax = evolve (List.sortBy scoreForMax)
let evolveForMin = evolve (List.sortBy scoreForMin)

let repeat n fn = Seq.replicate n fn |> Seq.reduce (>>)

let simulate seed generations evolver =
  seed
  |> Seq.toList |> List.map (string >> int)
  |> (fun x -> [x])
  |> repeat generations evolver
  |> List.head
  |> (fun x -> x |> List.map string |> String.concat "")

let isValid s =
  s
  |> Seq.toList
  |> List.map (string >> int)
  |> compute
  |> (fun z -> if z = 0 then "Yes" else "No")
  |> printfn "Is it valid? %s"

// Discover a solution
// Use this to sample for valid solutions
// Starting value does not need to be valid
simulate "77777777777777" 10000 evolveForValidity
|> (fun s -> printfn "Some close-to-valid solution: %s" s; s)
|> isValid

// From the sampling above, pick a high (valid) value as a seed
// This will likely find the max
simulate "85593966291626" 5000 evolveForMax
|> (fun s -> printfn "Part 1: %s" s; s)
|> isValid

// From the sampling above, pick a low (valid) value as a seed
// This will likely find the min
simulate "46482988181532" 10000 evolveForMin // pick a low value sampled from above
|> (fun s -> printfn "Part 2: %s" s; s)
|> isValid
