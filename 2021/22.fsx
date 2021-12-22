open System
open System.IO

type CuboidState = | On | Off
type Cuboid = | Cuboid of (((int64 * int64) * (int64 * int64) * (int64 * int64)) * CuboidState)

let overlap rangeA rangeB =
  match rangeA, rangeB with
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

let volume cuboid =
  match cuboid with
  | Cuboid (points, value) ->
    let (x1, x2), (y1, y2), (z1, z2) = points
    let sign =
      match value with
      | On -> 1L
      | Off -> -1L
    ((abs (x1 - x2)) + 1L) * ((abs (y1 - y2)) + 1L) * ((abs (z1 - z2)) + 1L) * sign

let reduceCuboids existingCuboids cuboid =
  existingCuboids
  |> Seq.fold
    (fun acc existingCuboid ->
      match existingCuboid, cuboid with
      | Cuboid(existingPoints, existingState), Cuboid(points, _) ->
        match (overlap3d existingPoints points), existingState with
        | Some overlap, On -> Cuboid(overlap, Off)::acc
        | Some overlap, Off -> Cuboid(overlap, On)::acc
        | None, _ -> acc)
    existingCuboids
  |> (fun newCuboids ->
        match cuboid with
        | Cuboid(_, On) -> cuboid::newCuboids
        | Cuboid(_, Off) -> newCuboids)

let countSwitchedOn cuboids =
  cuboids
  |> Seq.fold reduceCuboids []
  |> Seq.map volume
  |> Seq.sum

let cuboids =
  File.ReadAllLines "22.input.txt"
  |> Seq.map
    (fun line ->
      let parseRange (rangeString: string) =
        match rangeString.Split([| "="; ".." |], StringSplitOptions.RemoveEmptyEntries) with
        | [| _; a; b |] -> (int64 a, int64 b)
        | e -> failwith (sprintf "Invalid range string %A" e)

      match line.Split([| " "; "," |], StringSplitOptions.RemoveEmptyEntries) with
      | [| value; xRange; yRange; zRange |] ->
        Cuboid
          ( ( parseRange xRange,
              parseRange yRange,
              parseRange zRange ),
            if value = "on" then On else Off )
      | e -> failwith (sprintf "Invalid input format %A" e))

cuboids
  |> Seq.filter
    (fun cuboid ->
      let valid n = -50L <= n && n <= 50L
      match cuboid with
      | Cuboid(points, _) ->
        let (x1, x2), (y1, y2), (z1, z2) = points
        valid x1 && valid x2 && valid y1 && valid y2 && valid z1 && valid z2)
  |> countSwitchedOn
  |> printfn "Part 1: %d"

cuboids
  |> countSwitchedOn
  |> printfn "Part 2: %d"
