open System
open System.IO

type CubeState = | On | Off
type Cube = | Cube of ((int64 * int64) * (int64 * int64) * (int64 * int64) * CubeState)

let overlap a b =
  match a, b with
  | (a1, a2), (b1, b2) when a1 <= b1 && b2 <= a2 -> Some (b1, b2)
  | (a1, a2), (b1, b2) when b1 <= a1 && a2 <= b2 -> Some (a1, a2)
  | (a1, a2), (b1, b2) when b1 <= a1 && a1 <= b2 && b2 <= a2 -> Some (a1, b2)
  | (a1, a2), (b1, b2) when a1 <= b1 && b1 <= a2 && a2 <= b2 -> Some (b1, a2)
  | _ -> None

let overlap3d a b =
  let ax, ay, az = a
  let bx, by, bz = b
  match overlap ax bx, overlap ay by, overlap az bz with
  | Some(cx), Some(cy), Some(cz) -> Some(cx, cy, cz)
  | _ -> None

let volume cube =
  match cube with
  | Cube ((x1, x2), (y1, y2), (z1, z2), value) ->
    let sign =
      match value with
      | On -> 1L
      | Off -> -1L
    ((abs (x1 - x2)) + 1L) * ((abs (y1 - y2)) + 1L) * ((abs (z1 - z2)) + 1L) * sign

let reduceCubes existingCubes cube =
  existingCubes
  |> Seq.fold
    (fun acc existingCube ->
      match existingCube, cube with
      | Cube(ax, ay, az, av), Cube(bx, by, bz, bv) ->
        match (overlap3d (ax, ay, az) (bx, by, bz)), av, bv with
        | Some(cx, cy, cz), On, _ -> Cube(cx, cy, cz, Off)::acc
        | Some(cx, cy, cz), Off, _ -> Cube(cx, cy, cz, On)::acc
        | None, _, _ -> acc)
    existingCubes
  |> (fun newCubes ->
        match cube with
        | Cube(_, _, _, On) -> cube::newCubes
        | Cube(_, _, _, Off) -> newCubes)

let (|SplitMulti|) (separators: string seq) (s: string) =
  match s.Trim().Split(separators |> Seq.toArray, StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList

let parseRange rangeString =
  match rangeString with
  | SplitMulti [ "="; ".." ] [ _; v1; v2 ] -> (int64 v1, int64 v2)
  | e -> failwith (sprintf "Invalid range string %A" e)

let inRange (min, max) x = min <= x && x <= max

let ranges =
  File.ReadAllLines "22.input.txt"
  |> Seq.map
    (fun line ->
      match line with
      | SplitMulti [ " "; "," ] [ value; xRange; yRange; zRange ] ->
        Cube
          ( parseRange xRange,
            parseRange yRange,
            parseRange zRange,
            if value = "on" then On else Off )
      | e -> failwith (sprintf "Invalid input format %A" e))

ranges
  |> Seq.filter
    (fun cube ->
      let valid = inRange (-50L, 50L)
      match cube with
      | Cube((x1, x2), (y1, y2), (z1, z2), _) when valid x1 && valid x2 && valid y1 && valid y2 && valid z1 && valid z2 -> true
      | _ -> false)
  |> Seq.fold reduceCubes []
  |> Seq.map volume
  |> Seq.sum
  |> printfn "Part 1: %d"

ranges
  |> Seq.fold reduceCubes []
  |> Seq.map volume
  |> Seq.sum
  |> printfn "Part 2: %d"

// printfn "%A" (overlap3d ((-1L,2L), (-1L,2L), (0L,2L)) ((-2L,1L), (-2L,1L), (-2L,1L)))
// printfn "%A" (volume (Cube((0L,2L), (0L,2L), (0L,2L), On)))
// overlap (1,3) (4,6) |> printfn "%A should be None"
// overlap (4,6) (1,3) |> printfn "%A should be None"
// overlap (1,4) (4,6) |> printfn "%A should be None"
// overlap (4,6) (1,4) |> printfn "%A should be None"
// overlap (1,4) (0,2) |> printfn "%A should be (1, 2)"
// overlap (0,2) (1,4) |> printfn "%A should be (1, 2)"
// overlap (1,4) (1,3) |> printfn "%A should be (1, 3)"
// overlap (1,3) (1,4) |> printfn "%A should be (1, 3)"
// overlap (1,4) (2,3) |> printfn "%A should be (2, 3)"
// overlap (2,3) (1,4) |> printfn "%A should be (2, 3)"
// overlap (2,3) (1,4) |> printfn "%A should be (2, 3)"
// overlap (1,4) (2,3) |> printfn "%A should be (2, 3)"
// overlap (1,4) (2,4) |> printfn "%A should be (2, 4)"
// overlap (2,4) (1,4) |> printfn "%A should be (2, 4)"
// overlap (1,4) (3,6) |> printfn "%A should be (3, 4)"
// overlap (3,6) (1,4) |> printfn "%A should be (3, 4)"
// overlap (1,4) (4,6) |> printfn "%A should be None"
// overlap (4,6) (1,4) |> printfn "%A should be None"
// overlap (1,4) (5,6) |> printfn "%A should be None"
// overlap (5,6) (1,4) |> printfn "%A should be None"

