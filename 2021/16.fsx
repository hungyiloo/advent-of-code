open System
open System.IO

type Operation = int64 list -> int64

type TypeId =
  | Literal
  | Operator of Operation

let (|TypeId|) x =
  match x with
  | 4L -> Literal
  | 0L -> Operator Seq.sum
  | 1L -> Operator (Seq.reduce (*))
  | 2L -> Operator Seq.min
  | 3L -> Operator Seq.max
  | 5L -> Operator (fun xs -> if Seq.item 0 xs > Seq.item 1 xs then 1L else 0L)
  | 6L -> Operator (fun xs -> if Seq.item 0 xs < Seq.item 1 xs then 1L else 0L)
  | 7L -> Operator (fun xs -> if Seq.item 0 xs = Seq.item 1 xs then 1L else 0L)
  | _ -> failwith (sprintf "Invalid type ID: %A" x)

type Length =
  | Count of int
  | Size of int
  | NoSubpackets

type Packet =
  { version: int64
    value: Option<int64>
    subpackets: List<Packet>
    operation: Option<Operation> }

let asInt bits = (0L, bits) ||> Seq.fold (fun n bit -> n <<< 1 ||| if bit then 1L else 0L)

let read (length: int) (bits: bool array) =
  let result = bits.[0..(length - 1)]
  let remaining = bits.[length..]
  (asInt result, remaining)

let read2 (length1: int) (length2: int) bits =
  let result1, bits = read length1 bits
  let result2, bits = read length2 bits
  (result1, result2, bits)

let hexToBits (hex: string) =
  hex.Trim()
  |> Seq.toArray
  |> Array.map (function
    | '0' -> [| false; false; false; false |]
    | '1' -> [| false; false; false; true |]
    | '2' -> [| false; false; true; false |]
    | '3' -> [| false; false; true; true |]
    | '4' -> [| false; true; false; false |]
    | '5' -> [| false; true; false; true |]
    | '6' -> [| false; true; true; false |]
    | '7' -> [| false; true; true; true |]
    | '8' -> [| true; false; false; false |]
    | '9' -> [| true; false; false; true |]
    | 'A' -> [| true; false; true; false |]
    | 'B' -> [| true; false; true; true |]
    | 'C' -> [| true; true; false; false |]
    | 'D' -> [| true; true; false; true |]
    | 'E' -> [| true; true; true; false |]
    | 'F' -> [| true; true; true; true |]
    | _ -> failwith "Invalid hex character")
  |> Array.concat

let printBits (bits: bool array) =
  bits
  |> Array.map (fun b -> if b then '1' else '0')
  |> String

let rec parseContinuingChunks bits (n: int64) =
  let continueFlag, n', bits = read2 1 4 bits
  let n = n <<< 4 ||| (int64 n')
  match continueFlag with
  | 1L -> parseContinuingChunks bits n
  | 0L -> n, bits
  | _ -> failwith (sprintf "Invalid chunk continuation flag: %A" continueFlag)

let rec parse bits =
  let version, bits = read 3 bits

  let (TypeId typeId), bits = read 3 bits

  let value, bits =
    match typeId with
    | Literal ->
      let n, bits = parseContinuingChunks bits 0L
      Some n, bits
    | _ -> None, bits

  let length, bits =
    match typeId with
    | Literal -> NoSubpackets, bits
    | _ ->
      let lengthTypeId, bits = read 1 bits
      match lengthTypeId with
      | 1L ->
        let count, bits = read 11 bits
        Count(int count), bits
      | 0L ->
        let size, bits = read 15 bits
        Size(int size), bits
      | _ -> failwith (sprintf "Invalid length type ID: %A" lengthTypeId)

  let subpackets, bits =
    match length with
    | Size size ->
      let bitCount = Array.length bits
      let mutable subpackets = []
      let mutable remainingBits = bits
      while bitCount - (Array.length remainingBits) < size do
        let subpacket, bits = parse remainingBits
        subpackets <- subpacket :: subpackets
        remainingBits <- bits
      subpackets, remainingBits
    | Count count ->
      let mutable subpackets = []
      let mutable remainingBits = bits
      while List.length subpackets < count do
        let subpacket, bits = parse remainingBits
        subpackets <- subpacket :: subpackets
        remainingBits <- bits
      subpackets, remainingBits
    | NoSubpackets -> [], bits

  let subpackets = subpackets |> List.rev

  let operation =
    match typeId with
    | Literal -> None
    | Operator op -> Some op

  { version = version
    value = value
    subpackets = subpackets
    operation = operation },
  bits

let rec versionSum (packet: Packet) =
  packet.version
  + (packet.subpackets |> Seq.sumBy versionSum)

let rec calculate (packet: Packet) =
  match packet.value, packet.operation with
  | Some x, _ -> x
  | _, Some op -> op (packet.subpackets |> List.map calculate)
  | _ -> failwith "Either literal value or operation must exist on a packet"

let packet =
  File.ReadAllText "16.input.txt"
  |> hexToBits
  |> parse
  |> fst

packet |> versionSum |> printfn "Part 1: %d"
packet |> calculate |> printfn "Part 2: %d"

