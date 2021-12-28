module Parsing

open System
open System.Text.RegularExpressions

let (|Split|) (separator: string) (s: string) =
  match s.Trim().Split([| separator |], StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList

let (|SplitMulti|) (separators: string seq) (s: string) =
  match s.Trim().Split(separators |> Seq.toArray, StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList

let (|Regex|_|) pattern input =
  let m = Regex.Match(input, pattern)
  if m.Success then Some(List.tail [ for g in m.Groups -> g.Value ])
  else None

let (|Int|_|) (x: string) =
  match Int32.TryParse x with
  | true, i -> Some i
  | _ -> None
