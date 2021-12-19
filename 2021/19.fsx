open System
open System.IO

type Scanner =
  { found: bool
    translation: int * int * int
    rotation: int * int * int
    beacons: List<int * int * int> }

let ROTATIONS =
  // all 24 physical rotations around a cube.
  // each triplet represents X, Y and Z numbers of quarter turns respectively.
  // (0 1 2 3 yaw + 1 3 pitch gives us 6 faces of the cube) * 0 1 2 3 roll for each face.
  [ 0, 0, 0; 1, 0, 0; 2, 0, 0; 3, 0, 0; 0, 1, 0; 0, 3, 0;
    0, 0, 1; 1, 0, 1; 2, 0, 1; 3, 0, 1; 0, 1, 1; 0, 3, 1;
    0, 0, 2; 1, 0, 2; 2, 0, 2; 3, 0, 2; 0, 1, 2; 0, 3, 2;
    0, 0, 3; 1, 0, 3; 2, 0, 3; 3, 0, 3; 0, 1, 3; 0, 3, 3; ]

// Instead of using trig functions, note that we are doing quarter turns
// so we can optimize by using a pattern matching map.
// (i.e. cosine or sine of 90°, 180° & 270° are all either 0, 1 or -1)
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

// Using matrix rotation rules, we can transform a point by rotating around X, Y or Z axes.
// see: https://en.wikipedia.org/wiki/Rotation_matrix#Basic_rotations
let rotateX turns (x, y, z) = x, (intcos turns)*y - (intsin turns)*z, (intsin turns)*y + (intcos turns)*z
let rotateY turns (x, y, z) = (intcos turns)*x + (intsin turns)*z, y, -(intsin turns)*x + (intcos turns)*z
let rotateZ turns (x, y, z) = (intcos turns)*x - (intsin turns)*y, (intsin turns)*x + (intcos turns)*y, z

let rotate rotation point =
  let xr, yr, zr = rotation
  point |> rotateX xr |> rotateY yr |> rotateZ zr

let translate translation point =
  let x, y, z = point
  let x', y', z' = translation
  x + x', y + y', z + z'

let countIntersection xs ys = xs |> List.fold (fun acc x -> acc + if List.contains x ys then 1 else 0) 0

let manhattanDistance (a, b) =
  let x1, y1, z1 = a
  let x2, y2, z2 = b
  (abs (x1 - x2)) + (abs (y1 - y2)) + (abs (z1 - z2))

let inline (++) xs ys = xs |> List.collect (fun x -> ys |> List.map (fun y -> x, y))

// Tries to absolutely locate a SCANNER with relation to a REFERENCE.
// Returns Some Scanner if location was successful or None if unsuccessful.
let locate reference scanner =
  if scanner.found then
    Some scanner
  else
    let mutable result = None
    for rotation in ROTATIONS do
      if Option.isNone result then
        let rotatedBeacons = scanner.beacons |> List.map (rotate rotation)
        let beaconPairs = rotatedBeacons ++ reference.beacons
        // Estimate the overlap using manhattan distance.
        // If it is really a translation, then there WILL be
        // at least 12 points on each scanner that are the same distance apart.
        // (i.e. Imagine 12 or more points are slid across the plane in some direction.
        //       Those sliding distances should be the same. )
        let estimatedOverlaps =
          beaconPairs
          |> List.groupBy manhattanDistance
          |> List.maxBy (snd >> List.length)
          |> snd
        if (List.length estimatedOverlaps) >= 12 then
          for (x, y, z), (x', y', z') in estimatedOverlaps do
            if Option.isNone result then
              let translation = x' - x, y' - y, z' - z
              let translatedBeacons = rotatedBeacons |> List.map (translate translation)
              // We still need to do a strict intersection count to find the final
              // true translation. Not sure if this can be optimized away or not.
              let exactOverlaps = countIntersection translatedBeacons reference.beacons
              if exactOverlaps >= 12 then
                result <- Some
                  { found = true
                    translation = translation
                    rotation = rotation
                    beacons = translatedBeacons }
    result

// For a given list of scanners, at least one of which is already located
// iteratively locate all the other scanners in the list.
let solve scanners =
  let mutable located, remaining = List.partition (fun s -> s.found) scanners
  let mutable locatedToScan = located
  while not (List.isEmpty remaining) do
    let mutable newlyLocated = []
    for reference in locatedToScan do
      let mutable stillRemaining = []
      for scanner in remaining do
        match locate reference scanner with
        | Some x -> newlyLocated <- x::newlyLocated
        | None -> stillRemaining <- scanner::stillRemaining
      remaining <- stillRemaining // only check unresolved scanners the next found
    located <- located @ locatedToScan // the found scanners that have just been checked can be archived
    locatedToScan <- newlyLocated // newly found scanners need to be checked next to find more lost scanners
    if List.isEmpty newlyLocated then
      failwith "There were no scanners located in this iteration. Stopping because this might loop indefinitely."
  located @ locatedToScan // return all the found scanners in a single list

let (|Split|) (separator: string) (s: string) =
  match s.Trim().Split([| separator |], StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList

let scanners =
  Seq.append (File.ReadLines "19.input.txt") [""]
  |> Seq.fold
    (fun (scanners, points) curr ->
    match curr with
    | Split "," [ x; y; z ] -> scanners, (int x, int y, int z)::points
    | "" ->
      match points with
      | [] -> scanners, []
      | _ ->
        { found = List.isEmpty scanners
          translation = 0,0,0
          rotation = 0,0,0
          beacons = points }::scanners, []
    | _ -> scanners, points)
    ([], [])
  |> fst
  |> List.rev
  |> solve

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
