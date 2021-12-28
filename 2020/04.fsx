#load "../lib/Parsing.fsx"
open Parsing
open System.IO

let passports =
  File.ReadAllText "04.input.txt"
  |> (function | Split "\n\n" records -> records)
  |> Seq.map
    (function
     | SplitMulti [" "; "\n"] pairs ->
       pairs
       |> Seq.map
         (function
          | Split ":" [ field; value; ] -> field, value
          | _ -> failwith "invalid passport field"))

let requiredFields = Set([ "byr"; "iyr"; "eyr"; "hgt"; "hcl"; "ecl"; "pid" ])

let hasRequiredFields passport =
  let passportFields = Set(passport |> Seq.map fst)
  Set.isSuperset passportFields requiredFields

let (|Measurement|_|) (x: string) =
  match x.Substring(0, x.Length - 2), x.Substring(x.Length - 2) with
  | Int i, "cm" -> Some(i, "cm")
  | Int i, "in" -> Some(i, "in")
  | _ -> None

let (|HexColor|_|) (x: string) =
  match x with
  | Regex @"^#[a-f0-9]{6}$" color -> Some color
  | _ -> None

let (|KnownColor|_|) (x: string) =
  match x with
  | "amb"
  | "blu"
  | "brn"
  | "gry"
  | "grn"
  | "hzl"
  | "oth" -> Some x
  | _ -> None

let isDataValid passport =
  passport
  |> Seq.forall
    (function
     | "byr", Int year -> 1920 <= year && year <= 2002
     | "iyr", Int year -> 2010 <= year && year <= 2020
     | "eyr", Int year -> 2020 <= year && year <= 2030
     | "hgt", Measurement(height, "cm") -> 150 <= height && height <= 193
     | "hgt", Measurement(height, "in") -> 59 <= height && height <= 76
     | "hcl", HexColor _
     | "ecl", KnownColor _
     | "pid", Regex @"^[0-9]{9}$" _
     | "cid", _ -> true
     | _ -> false)

passports
|> Seq.countBy hasRequiredFields
|> Seq.tryPick (function | true, count -> Some count | _ -> None)
|> printfn "Part 1: %A"

passports
|> Seq.countBy (fun p -> hasRequiredFields p && isDataValid p)
|> Seq.tryPick (function | true, count -> Some count | _ -> None)
|> printfn "Part 2: %A"
