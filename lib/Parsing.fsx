module Parsing

open System

let (|Split|) (separator: string) (s: string) =
  match s.Trim().Split([| separator |], StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList

let (|SplitMulti|) (separators: string seq) (s: string) =
  match s.Trim().Split(separators |> Seq.toArray, StringSplitOptions.RemoveEmptyEntries) with
  | arr -> arr |> Seq.toList
