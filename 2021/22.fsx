open System
open System.IO

type CuboidType = | Add | Subtract
type Cuboid = | Cuboid of (((int64 * int64) * (int64 * int64) * (int64 * int64)) * CuboidType)

// Returns the overlapping Some range between two 1D ranges, or None if they don't overlap.
// Note that if the range boundaries touch, they DO overlap in the context of this puzzle
// since they hit the same points.
let overlap1D rangeA rangeB =
  match rangeA, rangeB with
  | (a1, a2), (b1, b2) when a1 <= b1 && b2 <= a2 -> Some (b1, b2)
  | (a1, a2), (b1, b2) when b1 <= a1 && a2 <= b2 -> Some (a1, a2)
  | (a1, a2), (b1, b2) when b1 <= a1 && a1 <= b2 && b2 <= a2 -> Some (a1, b2)
  | (a1, a2), (b1, b2) when a1 <= b1 && b1 <= a2 && a2 <= b2 -> Some (b1, a2)
  | _ -> None

// Use overlap1D to create a 3D version with the same sentiment
let overlap3D a b =
  let ax, ay, az = a
  let bx, by, bz = b
  match overlap1D ax bx, overlap1D ay by, overlap1D az bz with
  | Some(cx), Some(cy), Some(cz) -> Some(cx, cy, cz)
  | _ -> None

// Calculates the volume of a cuboid, taking into account its Add/Subtract nature.
// Note that a ((0,1), (0,1), (0,1)) cuboid is NOT of volume 1 in the puzzle context.
// Since it touches TWO points on each edge, it is of volume 2x2x2 = 8
let volume cuboid =
  match cuboid with
  | Cuboid (points, value) ->
    let (x1, x2), (y1, y2), (z1, z2) = points
    let sign =
      match value with
      | Add -> 1L
      | Subtract -> -1L
    ((abs (x1 - x2)) + 1L) * ((abs (y1 - y2)) + 1L) * ((abs (z1 - z2)) + 1L) * sign

// Add and Subtract cuboids one by one, comparing overlaps with the accumulated
// list of existing cuboids in space, making sure to compensate for double counting.
let reduceCuboids existingCuboids cuboid =
  existingCuboids
  |> Seq.fold
    (fun acc existingCuboid ->
      match existingCuboid, cuboid with
      | Cuboid(existingPoints, existingState), Cuboid(points, _) ->
        match (overlap3D existingPoints points), existingState with
        // This is the trick:
        // Overlapping cuboids need to be negated to "fix" the double counting
        // If we're adding a cuboid (i.e. switching on) then the overlaps must be subtracted
        // If we're subtracting a cuboid (i.e. switching off) then the overlaps must be added back,
        // (since we already subtracted that region before)
        | Some overlap, Add -> Cuboid(overlap, Subtract)::acc
        | Some overlap, Subtract -> Cuboid(overlap, Add)::acc
        | None, _ -> acc)
    existingCuboids
  |> (fun newCuboids ->
        match cuboid with
        // Then Add the new cuboid to the space if we're adding.
        // If Subtracting, we don't need to add anything, as the overlaps do all the work.
        | Cuboid(_, Add) -> cuboid::newCuboids
        | Cuboid(_, Subtract) -> newCuboids)

let countSwitchedOn cuboids =
  cuboids
  |> Seq.fold reduceCuboids []
  |> Seq.map volume
  |> Seq.sum

// Read and parse the cuboids from the puzzle input
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
            if value = "on" then Add else Subtract )
      | e -> failwith (sprintf "Invalid input format %A" e))

cuboids
  // part 1 requires us to filter the cuboids to those within [-50, 50] coordinates
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
  // part 2 is just part 1 without the filter
  |> countSwitchedOn
  |> printfn "Part 2: %d"
