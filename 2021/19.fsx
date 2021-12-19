open System
open System.IO

let (|Split|) (separator: string) (s: string) =
  match s.Trim().Split([| separator |], StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList

let inline (++) xs ys = xs |> List.collect (fun x -> ys |> List.map (fun y -> x, y))

type Scanner =
  { found: bool
    translation: int * int * int
    rotation: int * int * int
    beacons: List<int * int * int> }

let ROTATIONS =
  // all physical 24 rotations around a cube.
  // each triplet represents X, Y and Z numbers of quarter turns respectively
  [ 0, 0, 0; 1, 0, 0; 2, 0, 0; 3, 0, 0; 0, 1, 0; 0, 3, 0;
    0, 0, 1; 1, 0, 1; 2, 0, 1; 3, 0, 1; 0, 1, 1; 0, 3, 1;
    0, 0, 2; 1, 0, 2; 2, 0, 2; 3, 0, 2; 0, 1, 2; 0, 3, 2;
    0, 0, 3; 1, 0, 3; 2, 0, 3; 3, 0, 3; 0, 1, 3; 0, 3, 3; ]

let intcos turns =
  match (turns + 4) % 4 with
  | 0 -> 1
  | 1 -> 0
  | 2 -> -1
  | 3 -> 0
  | _ -> failwith "Modulo failed?!"

let intsin turns =
  match (turns + 4) % 4 with
  | 0 -> 0
  | 1 -> 1
  | 2 -> 0
  | 3 -> -1
  | _ -> failwith "Modulo failed?!"

let rotateX n (x, y, z) = x, (intcos n)*y - (intsin n)*z, (intsin n)*y + (intcos n)*z
let rotateY n (x, y, z) = (intcos n)*x + (intsin n)*z, y, -(intsin n)*x + (intcos n)*z
let rotateZ n (x, y, z) = (intcos n)*x - (intsin n)*y, (intsin n)*x + (intcos n)*y, z

let rotate rotation point =
  let xr, yr, zr = rotation
  point |> rotateX xr |> rotateY yr |> rotateZ zr

let translate translation point =
  let x, y, z = point
  let x', y', z' = translation
  x + x', y + y', z + z'

let intersect xs ys = xs |> List.filter (fun x -> List.contains x ys)

let locate reference scanner =
  if scanner.found then
    Some scanner
  else
    let mutable result = None
    for rotation in ROTATIONS do
      if Option.isNone result then
        let rotatedBeacons = scanner.beacons |> List.map (rotate rotation)
        let beaconPairs = rotatedBeacons ++ reference.beacons
        for ((x, y, z), (x', y', z')) in beaconPairs do
          if Option.isNone result then
            let translation = x' - x, y' - y, z' - z
            let translatedBeacons = rotatedBeacons |> List.map (translate translation)
            let matches = intersect translatedBeacons reference.beacons
            if (List.length matches) >= 12 then
              result <- Some
                { found = true
                  translation = translation
                  rotation = rotation
                  beacons = translatedBeacons }
    result

let solve scanners =
  let mutable allFound, remaining = List.partition (fun s -> s.found) scanners
  let mutable found = allFound
  while not (List.isEmpty remaining) do
    printfn "Found: %A; Still remaining: %A" (List.length allFound) (List.length remaining)
    let mutable newlyFound = []
    for reference in found do
      let mutable stillRemaining = []
      for scanner in remaining do
        match locate reference scanner with
        | Some x ->
          // printfn "Located %A" x
          newlyFound <- x::newlyFound
        | None -> stillRemaining <- scanner::stillRemaining
      remaining <- stillRemaining
    allFound <- allFound @ found
    found <- newlyFound
  allFound @ found

let manhattanDistance (a, b) =
  let x1, y1, z1 = a
  let x2, y2, z2 = b
  (abs (x1 - x2)) + (abs (y1 - y2)) + (abs (z1 - z2))

let lostScanners =
  Seq.append (File.ReadLines "19.input.txt") [""]
  |> Seq.fold
    (fun (scanners, points) curr ->
    match curr with
    | Split "," [ x; y; z ] -> scanners, (int x, int y, int z)::points
    | "" ->
     { found = List.isEmpty scanners
       translation = 0,0,0
       rotation = 0,0,0
       beacons = points }::scanners, []
    | _ -> scanners, points)
    ([], [])
  |> fst
  |> List.rev

let scanners = solve lostScanners

scanners
|> List.collect (fun s -> s.beacons)
|> List.distinct
|> List.length
|> printfn "Part 1: %A"

let scannerLocations = scanners |> List.map (fun s -> s.translation)

scannerLocations ++ scannerLocations
|> Seq.map manhattanDistance
|> Seq.max
|> printfn "Part 2: %A"
