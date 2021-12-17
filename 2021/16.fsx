open System.IO

type Operation = int64 list -> int64

type PacketType =
  | Literal
  | Operator of Operation

let (|PacketType|) x =
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
  bits.[0..(length - 1)] |> asInt,
  bits.[length..]

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

let rec parseContinuingChunks bits (n: int64) =
  let continueFlag, bits = read 1 bits
  let n', bits = read 4 bits
  let nextN = n <<< 4 ||| (int64 n')
  match continueFlag with
  | 1L -> parseContinuingChunks bits nextN
  | 0L -> nextN, bits
  | _ -> failwith (sprintf "Invalid chunk continuation flag: %A" continueFlag)

let rec parse bits =
  let version, bits = read 3 bits

  let (PacketType packetType), bits = read 3 bits

  let value, bits =
    match packetType with
    | Literal ->
      let n, bits = parseContinuingChunks bits 0L
      Some n, bits
    | _ -> None, bits

  let length, bits =
    match packetType with
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
    let mutable subpackets = []
    let mutable remainingBits = bits
    match length with
    | Size size ->
      let bitCount = Array.length bits
      while bitCount - (Array.length remainingBits) < size do
        let subpacket, bits = parse remainingBits
        subpackets <- subpacket :: subpackets
        remainingBits <- bits
    | Count count ->
      while List.length subpackets < count do
        let subpacket, bits = parse remainingBits
        subpackets <- subpacket :: subpackets
        remainingBits <- bits
    | NoSubpackets -> ()
    subpackets, remainingBits

  let subpackets = subpackets |> List.rev

  let operation =
    match packetType with
    | Literal -> None
    | Operator op -> Some op

  { version = version
    value = value
    subpackets = subpackets
    operation = operation },
  bits

let rec versionSum packet = packet.version + (packet.subpackets |> Seq.sumBy versionSum)

let rec calculate packet =
  match packet.value, packet.operation with
  | Some x, _ -> x
  | _, Some op -> op (packet.subpackets |> List.map calculate)
  | _ -> failwith "Either literal value or operation must exist on a packet"

let packet = File.ReadAllText "16.input.txt" |> hexToBits |> parse |> fst
packet |> versionSum |> printfn "Part 1: %d"
packet |> calculate |> printfn "Part 2: %d"
