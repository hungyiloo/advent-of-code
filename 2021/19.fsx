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

  let rotateX n (x, y, z) =
    1*x + 0*y + 0*z,
    0*x + (intcos n)*y - (intsin n)*z,
    0*x + (intsin n)*y + (intcos n)*z

  let rotateY n (x, y, z) =
    (intcos n)*x + 0*y + (intsin n)*z,
    0*x + 1*y - 0*z,
    -(intsin n)*x + 0*y + (intcos n)*z

  let rotateZ n (x, y, z) =
    (intcos n)*x - (intsin n)*y + 0*z,
    (intsin n)*x + (intcos n)*y - 0*z,
    0*x + 0*y + 1*z

  let xr, yr, zr = rotation

  point |> rotateX xr |> rotateY yr |> rotateZ zr

let translate translation point =
  let x, y, z = point
  let x', y', z' = translation
  x + x', y + y', z + z'

let intersect xs ys = xs |> List.filter (fun x -> List.contains x ys)

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
  let mutable references, remaining = List.partition (fun s -> s.found) scanners
  let mutable reference = List.head references
  while not (List.isEmpty remaining) do
    let found, lost =
      ((None, []), remaining)
      ||> List.fold
        (fun (found, lost) scanner ->
         match found with
         | Some _ -> found, scanner::lost
         | None ->
           match locate reference scanner with
           | Some x -> Some x, lost
           | None -> None, scanner::lost)
    match found with
    | Some x -> reference <- x
    | _ -> ()
    remaining <- lost
    printfn "%A" (List.length remaining)
  references

solve scanners
|> printfn "%A"
