#load "../lib/Parsing.fsx"
open Parsing
open System.IO

let passports =
  File.ReadAllText "04.input.txt"
  |> (fun input -> input.Split([| "\n\n" |], StringSplitOptions.RemoveEmptyEntries))
  |> Seq.map
    (function
     | SplitMulti [" "; "\n"] pairs ->
       pairs
       |> Seq.map
         (function
          | Split ":" [ field; value; ] -> field, value
          | _ -> failwith "invalid passport field"))

let requiredFields = [ "byr"; "iyr"; "eyr"; "hgt"; "hcl"; "ecl"; "pid" ]

let hasRequiredFields passport =
  let passportFields = Set(passport |> Seq.map fst)
  requiredFields |> Seq.forall (fun f -> Set.contains f passportFields)

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
    (fun pair ->
     match pair with
     | "byr", Int year when 1920 <= year && year <= 2002 -> true
     | "iyr", Int year when 2010 <= year && year <= 2020 -> true
     | "eyr", Int year when 2020 <= year && year <= 2030 -> true
     | "hgt", Measurement(height, "cm") when 150 <= height && height <= 193 -> true
     | "hgt", Measurement(height, "in") when 59 <= height && height <= 76 -> true
     | "hcl", HexColor _  -> true
     | "ecl", KnownColor _  -> true
     | "pid", Regex @"^[0-9]{9}$" _  -> true
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
