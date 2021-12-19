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
  // all physical 24 rotations around a cube
  [ 0, 0, 0; 1, 0, 0; 2, 0, 0; 3, 0, 0; 0, 1, 0; 0, 3, 0;
    0, 0, 1; 1, 0, 1; 2, 0, 1; 3, 0, 1; 0, 1, 1; 0, 3, 1;
    0, 0, 2; 1, 0, 2; 2, 0, 2; 3, 0, 2; 0, 1, 2; 0, 3, 2;
    0, 0, 3; 1, 0, 3; 2, 0, 3; 3, 0, 3; 0, 1, 3; 0, 3, 3; ]

let rotate rotation point =
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
    printfn "Still remaining: %A" (List.length remaining)
    let mutable newlyFound = []
    for reference in found do
      let mutable stillRemaining = []
      for scanner in remaining do
        match locate reference scanner with
        | Some x ->
          printfn "Located %A" x
          newlyFound <- x::newlyFound
        | None -> stillRemaining <- scanner::stillRemaining
      remaining <- stillRemaining
    allFound <- allFound @ found
    found <- newlyFound
  allFound @ found

let scanners =
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

// solve scanners
// |> List.collect (fun s -> s.beacons)
// |> List.distinct
// |> List.length
// |> printfn "Part 1: %A"

let scannerLocations = [
  (147, 155, -1150)
  (84, -12, -2408)
  (-1111, -15, -1172)
  (-1069, 1334, -1335)
  (140, 1336, -2439)
  (152, 57, -3678)
  (91, 1367, -3627)
  (25, -1081, -3562)
  (-1172, 1211, -2375)
  (73, 2415, -2429)
  (-1125, 2470, -1239)
  (-1061, 3690, -1300)
  (-2300, 2420, -1172)
  (130, 2535, -3661)
  (-2296, 1210, -2351)
  (40, -2227, -3679)
  (61, 1318, -4788)
  (-1230, 1218, -4909)
  (1189, 1325, -4821)
  (-7, 2465, -4812)
  (43, -2315, -2539)
  (-1133, -2226, -3620)
  (39, -3432, -3735)
  (-1166, 2471, -3551)
  (37, 3619, -1177)
  (-1041, 3750, -2376)
  (-1168, 4811, -2507)
  (86, 4852, -1290)
  (-2428, -2405, -3634)
  (30, 2407, -5973)
  (1176, 1237, -5981)
  (1182, 2551, -6086)
  (10, 4959, 1)
  (51, 6081, -1202)
  (139, 7342, -1144)
  (-1201, 6159, -1249)
  (4, 6024, -123)
  (-1091, 4964, -52)
  (-2393, 4828, -81)
]

let manhattanDistance (a, b) =
  let x1, y1, z1 = a
  let x2, y2, z2 = b
  (abs (x1 - x2)) + (abs (y1 - y2)) + (abs (z1 - z2))

scannerLocations ++ scannerLocations
|> Seq.map manhattanDistance
|> Seq.max
|> printfn "Part 2: %A"
