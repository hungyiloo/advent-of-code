open System
open System.IO

let (|Split|) (separator: string) (s: string) =
  match s.Trim().Split([| separator |], StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList

let parseLine line =
  match line with
  | Split "," [ p1; p2 ] -> p1, p2
  | _ -> failwith "Invalid input line"

let rawDecoder, rawImageLines =
  File.ReadAllLines "20.input.txt"
  |> Seq.toList
  |> (fun lines ->
      match lines with
      | decoder::_::imageLines -> decoder, imageLines
      | _ -> failwith "Invalid input format")

let decoder = rawDecoder |> Seq.map (fun c -> c = '#') |> Seq.toArray

let image =
  rawImageLines
  |> Seq.mapi (fun x l -> Seq.mapi (fun y c -> (x, y), c = '#') l)
  |> Seq.concat
  |> Seq.fold
    (fun image (coord, value) -> Map.add coord value image)
    Map.empty<int * int, bool>

let getGrid (x, y) =
  [ (x, y)
    (x + 1, y)
    (x - 1, y)
    (x, y + 1)
    (x, y - 1)
    (x + 1, y + 1)
    (x - 1, y - 1)
    (x + 1, y - 1)
    (x - 1, y + 1) ]

let gridAsInt coords image =
  coords
  |> Seq.map (fun coord ->
              match Map.tryFind coord image with
              | Some v -> v
              | None -> false)
  |> Seq.fold (fun acc n -> acc <<< 1 ||| if n then 1 else 0) 0

let decodeImageAt coord image =
  let grid = getGrid coord
  let key = gridAsInt grid image
  decoder.[key]

let inline (++) xs ys = xs |> List.collect (fun x -> ys |> List.map (fun y -> x, y))

let step (image: Map<int * int, bool>) =
  let allCoords = Map.keys image
  let x1 = (allCoords |> Seq.map fst |> Seq.min) - 1
  let x2 = (allCoords |> Seq.map fst |> Seq.max) + 1
  let y1 = (allCoords |> Seq.map snd |> Seq.min) - 1
  let y2 = (allCoords |> Seq.map snd |> Seq.max) + 1
  [x1..x2] ++ [y1..y2]
  |> Seq.fold
    (fun nextImage coord -> Map.add coord (decodeImageAt coord image) nextImage)
    Map.empty<int * int, bool>

let repeat n fn = Seq.replicate n fn |> Seq.reduce (>>)

let countLit image = Map.values image |> Seq.map (fun v -> if v then 1 else 0) |> Seq.sum

repeat 2 step image
|> countLit
|> printfn "Part 1: %A"
