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

let isValid state = getZ state = 0

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
    // printfn "%A" nextState
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

let score (input: int list) =
  let s1 = input |> Seq.map string |> String.concat "" |> int64
  let s2 = compute input
  if s2 = 0 then
    printfn "%A" input
  s1 - (abs ((int64 s2) * 10000000000L))

let r = System.Random()
let mutate input =
  input
  |> List.map
    (fun digit ->
     let doMutate = r.Next(0, 8) = 1
     if doMutate
     then
       let mutation = r.Next(1, 7)
       (((digit - 1) + mutation) % 9) + 1
     else digit)

// for i in [1111..2222] do
// let s = "999999999" + string i + "1"
// let s = "99993999999999"
// instructions
// |> Seq.fold reduce { registers = Map.empty; stack = s |> Seq.toList |> List.map (string >> int) }
// |> getZ
// |> printfn "%A %A" s

let evolve (inputs: int list list) =
  List.replicate 10 inputs
  |> List.concat
  |> List.map mutate
  |> List.sortByDescending score
  |> List.take 2

let repeat n fn = Seq.replicate n fn |> Seq.reduce (>>)

// "99999999999999"
// |> Seq.toList |> List.map (string >> int)
// |> (fun x -> [x])
// |> repeat 1000 evolve
// |> List.map (fun x -> x, compute x)
// |> printfn "%A"

// success example
"99393911291467"
|> Seq.toList |> List.map (string >> int)
|> compute
|> printfn "%A"
