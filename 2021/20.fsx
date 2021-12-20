open System
open System.IO

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
  [ (x-1, y-1); (x-1, y); (x-1, y+1)
    (x, y-1);   (x, y);   (x, y+1)
    (x+1, y-1); (x+1, y); (x+1, y+1) ]

let getImagePixel (fallback, image) coord =
  match Map.tryFind coord image with
  | Some v -> v
  // Untracked pixels are set with a fallback value.
  // They can be on or off depending on the cycle, which is handled in the step function.
  | None -> fallback

let decodeBitArray arr =
  arr
  |> Seq.fold (fun acc n -> (acc <<< 1) ||| if n then 1 else 0) 0
  |> (fun n -> decoder.[n])

let inline (++) xs ys = xs |> List.collect (fun x -> ys |> List.map (fun y -> x, y))

let getImageSize image =
  let allCoords = Map.keys image
  let allX = allCoords |> Seq.map fst
  let allY = allCoords |> Seq.map snd
  let x1 = (allX |> Seq.min) - 1
  let x2 = (allX |> Seq.max) + 1
  let y1 = (allY |> Seq.min) - 1
  let y2 = (allY |> Seq.max) + 1
  x1, x2, y1, y2

// Recalculates the fallback pixel value, on or off, for tracking the infinite plane.
// We do this by creating a virtual grid full of previous fallback values,
// then using this array of all on or off whether the next fallback is on or off based on the decoder array.
// "If a tree falls in the forest..." the result is decided entirely on the decoder array!
// Hint: Usually this maps to the first and last characters of the decoder line. (i.e. all 0 or all 1)
let recalculateFallback fallback = Array.create 9 fallback |> decodeBitArray

let step (fallback, image) =
  let x1, x2, y1, y2 = getImageSize image
  let nextImage =
    [x1..x2] ++ [y1..y2]
    |> Seq.map
      (fun coord ->
        coord,
        coord
        |> getGrid
        |> Seq.map (getImagePixel (fallback, image))
        |> decodeBitArray)
    |> Seq.fold
      (fun nextImage (coord, pixel) -> Map.add coord pixel nextImage)
      Map.empty<int * int, bool>

  recalculateFallback fallback, // recalculate the next fallback
  nextImage

let repeat n fn = Seq.replicate n fn |> Seq.reduce (>>)

let countLit image = Map.values image |> Seq.map (fun v -> if v then 1 else 0) |> Seq.sum

let printImage (fallback, image) =
  let x1, x2, y1, y2 = getImageSize image
  [x1..x2]
  |> List.map
    (fun x ->
     [y1..y2]
     |> List.map (fun y -> x, y)
     |> Seq.map (getImagePixel (fallback, image))
     |> Seq.map (function | true -> '#' | false ->  '.')
     |> Seq.toArray
     |> String)
  |> Seq.iter (printfn "%s")

  fallback, image

repeat 2 step (false, image) // first fallback for infinite plane is all off, as defined by the puzzle
// |> printImage
|> snd
|> countLit
|> printfn "Part 1: %A"

repeat 50 step (false, image)
// |> printImage
|> snd
|> countLit
|> printfn "Part 2: %A"
