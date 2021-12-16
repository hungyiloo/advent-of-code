open System
open System.Linq
open System.Collections
open System.IO

type Operation = int64 list -> int64

type TypeId =
  | Literal
  | Operator of Operation

let (|TypeId|) x =
  match x with
  | 4 -> Literal
  | 0 -> Operator Seq.sum
  | 1 -> Operator (Seq.reduce (*))
  | 2 -> Operator Seq.min
  | 3 -> Operator Seq.max
  | 5 -> Operator (fun xs -> if Seq.item 0 xs > Seq.item 1 xs then 1L else 0L)
  | 6 -> Operator (fun xs -> if Seq.item 0 xs < Seq.item 1 xs then 1L else 0L)
  | 7 -> Operator (fun xs -> if Seq.item 0 xs = Seq.item 1 xs then 1L else 0L)
  | _ -> failwith (sprintf "Invalid type ID: %A" x)

type Length =
  | Count of int
  | Size of int

let (|LengthTypeId|) x =
  match x with
  | 1 -> Count, 11
  | 0 -> Size, 15
  | _ -> failwith (sprintf "Invalid length type ID: %A" x)

type Chunk = Continue | Stop

let (|Chunk|) x =
  match x with
  | 1 -> Continue
  | 0 -> Stop
  | _ -> failwith (sprintf "Invalid chunk type: %A" x)

type Packet = {
  version: int
  typeId: TypeId
  value: Option<int64>
  length: Option<Length>
  subpackets: List<Packet>
  operation: Option<Operation>
}

let asInt (fromBits: BitArray) =
  (0, fromBits.Cast() |> Seq.rev)
  ||> Seq.fold
    (fun n bit ->
     let n = n <<< 1
     if bit then n ||| 1 else n)

let read (length: int) (fromBits: BitArray) =
  let result = BitArray(length)
  [(fromBits.Count-length)..(fromBits.Count-1)]
  |> List.iteri (fun i' i -> result.Set(i', fromBits.[i]))

  let remaining = BitArray(fromBits.Count - length)
  [0..(fromBits.Count-length-1)]
  |> List.iter (fun i -> remaining.Set(i, fromBits.[i]))

  (asInt result, remaining)

let read2 (length1: int) (length2: int) (fromBits: BitArray) =
  let result1, bits = read length1 fromBits
  let result2, bits = read length2 bits
  (result1, result2, bits)

let hexToBits (hex: string) =
  // Convert.FromHexString(hex.Trim()) |> Array.rev |> BitArray
  hex.Trim()
  |> Seq.chunkBySize 2
  |> Seq.map (fun cs -> Convert.ToByte(String (Seq.toArray cs), 16))
  |> Seq.rev
  |> Seq.toArray
  |> BitArray

let rec parse (bits: BitArray) =
  let version, bits = read 3 bits
  let (TypeId typeId), bits = read 3 bits
  let value, bits =
    match typeId with
    | Literal ->
      let rec parseChunks bits (n: int64) =
        let (Chunk c), n', bits = read2 1 4 bits
        let (n: int64) = n <<< 4 ||| (int64 n')
        match c with
        | Continue -> parseChunks bits n
        | Stop -> n, bits
      let n, bits = parseChunks bits 0L
      Some n, bits
    | _ -> None, bits
  let length, bits =
    match typeId with
    | Literal -> None, bits
    | _ ->
      let (LengthTypeId (makeLength, lengthBits)), bits = read 1 bits
      let lengthNum, bits = read lengthBits bits
      Some(makeLength lengthNum), bits
  let subpackets, bits =
    match length with
    | Some(Size size) ->
      let bitCount = bits.Count
      let mutable subpackets = []
      let mutable remainingBits = bits
      while bitCount - remainingBits.Count < size do
        let subpacket, bits = parse remainingBits
        subpackets <- subpacket::subpackets
        remainingBits <- bits
      subpackets, remainingBits
    | Some(Count count) ->
      let mutable subpackets = []
      let mutable remainingBits = bits
      while List.length subpackets < count do
        let subpacket, bits = parse remainingBits
        subpackets <- subpacket::subpackets
        remainingBits <- bits
      subpackets, remainingBits
    | None -> [], bits
  let subpackets = subpackets |> List.rev
  let operation =
    match typeId with
    | Literal -> None
    | Operator op -> Some op

  {version = version; typeId = typeId; value = value; length = length; subpackets = subpackets; operation = operation}, bits

let rec versionSum (packet: Packet) =
  packet.version + (packet.subpackets |> Seq.sumBy versionSum)

let rec calculate (packet: Packet) =
  match packet.value, packet.operation with
  | Some x, _ -> x
  | _, Some op -> op (packet.subpackets |> List.map calculate)
  | _ -> failwith "Value or operation must exist on a packet"

let packet =
  // "F600BC2D8F"
  File.ReadAllText "16.input.txt"
  |> hexToBits
  |> parse
  |> fst

packet
|> versionSum
|> printfn "Part 1: %A"

packet
|> calculate
|> printfn "Part 2: %A"
