#load "../lib/Memoization.fsx"
open Memoization
open System.Collections.Generic
open System.IO

type Letter = A | B | C | D
type GameState = { roomA: Option<Letter> array; roomB: Option<Letter> array; roomC: Option<Letter> array; roomD: Option<Letter> array; hallway: Option<Letter> array }
type Outcome = { state: GameState; cost: int }

let getRoom state room =
  match room with
  | A -> state.roomA
  | B -> state.roomB
  | C -> state.roomC
  | D -> state.roomD

let validHallwayPlaces = [ 0; 1; 3; 5; 7; 9; 10 ]
let letters = [ A; B; C; D ]
let getRoomHallwayPlace = function | A -> 2 | B -> 4 | C -> 6 | D -> 8
let energy = function | A -> 1 | B -> 10 | C -> 100 | D -> 1000
let roomWin letter room = room |> Array.forall ((=) (Some letter))
let roomHasForeigners letter room = room |> Array.choose id |> Array.exists ((<>) letter)
let roomFirstOccupant room = room |> Array.mapi (fun i x -> match x with | Some l -> Some(i, l) | None -> None) |> Array.tryPick id
let roomDeepestVacancy room = room |> Array.mapi (fun i x -> match x with | None -> Some(i) | Some _ -> None) |> Array.rev |> Array.tryPick id
let win state = [ A; B; C; D ] |> List.forall (fun letter -> getRoom state letter |> roomWin letter)
let clone state = { roomA = state.roomA.[*]; roomB = state.roomB.[*]; roomC = state.roomC.[*]; roomD = state.roomD.[*]; hallway = state.hallway.[*] }
let getMoveCost letter roomLetter depth hallwayPlace  = energy letter * ((abs (hallwayPlace - getRoomHallwayPlace roomLetter)) + depth + 1)

let isHallwayBlocked state fromPlace toPlace =
  validHallwayPlaces
  |> List.filter (fun p -> (fromPlace < p && p <= toPlace) || (toPlace <= p && p < fromPlace))
  |> List.exists (fun p -> match state.hallway.[p] with | Some _ -> true | None -> false)

let nextStates =
  memoize
    (fun state ->
      let roomMoves =
        letters
        |> Seq.collect
          (fun roomLetter ->
          let room = getRoom state roomLetter
          if roomWin roomLetter room
          then []
          else
            match roomFirstOccupant room with
            | None -> []
            | Some(depth, letter) ->
              validHallwayPlaces
              |> List.filter (isHallwayBlocked state (getRoomHallwayPlace roomLetter) >> not)
              |> List.map
                (fun place ->
                  let nextState = clone state
                  let room = getRoom nextState roomLetter
                  room.[depth] <- None
                  nextState.hallway.[place] <- Some letter
                  let additionalCost = getMoveCost letter roomLetter depth place
                  nextState, additionalCost))
      let hallwayMoves =
        validHallwayPlaces
        |> Seq.choose
          (fun place ->
            match state.hallway.[place] with
            | None -> None
            | Some letter ->
              let targetPlace = getRoomHallwayPlace letter
              let hallwayBlocked = isHallwayBlocked state place targetPlace
              if hallwayBlocked
              then None
              else
                let targetRoom = getRoom state letter
                let targetRoomHasForeigners = roomHasForeigners letter targetRoom
                if targetRoomHasForeigners
                then None
                else
                  let nextState = clone state
                  nextState.hallway.[place] <- None
                  let targetRoom = getRoom nextState letter
                  match roomDeepestVacancy targetRoom with
                  | Some vacantDepth ->
                    targetRoom.[vacantDepth] <- Some letter
                    let additionalCost = getMoveCost letter letter vacantDepth place
                    Some(nextState, additionalCost)
                  | None -> None)
      Seq.concat [roomMoves; hallwayMoves])

let dijkstra start =
  let insertByCost pq newOutcome =
    let index = List.tryFindIndex (fun outcome -> outcome.cost > newOutcome.cost) pq
    match index with
    | Some i -> List.insertAt i newOutcome pq
    | None -> List.insertAt (List.length pq) newOutcome pq

  let costs = new Dictionary<GameState, int>()
  let explore pq =
    let bestOutcome, pq =
      match pq with
      | head::pq -> head, pq
      | _ -> failwith "Can't explore an empty queue"
    let states = nextStates bestOutcome.state
    (pq, states)
    ||> Seq.fold
      (fun pq (state, additionalCost) ->
         let nextCost = bestOutcome.cost + additionalCost
         match costs.TryGetValue state with
         // if this state has been seen before cheaper, abandon this line of search
         | true, lastCost when lastCost <= nextCost -> pq
         // if this state has been seen before but the new path is cheaper, abandon old lines of search
         | true, _ ->
           costs.[state] <- nextCost
           let pq = pq |> List.filter (fun o -> o.state <> state)
           insertByCost pq { state = state; cost = nextCost }
         // if this is the first time seeing this state, track its cost
         | false, _ ->
           costs.[state] <- nextCost
           insertByCost pq { state = state; cost = nextCost })

  let rec search pq =
    let bestOutcome = List.head pq
    if win bestOutcome.state
    then bestOutcome.cost
    else search (explore pq)

  search [start]

let parseLetter = function
  | 'A' -> Some A
  | 'B' -> Some B
  | 'C' -> Some C
  | 'D' -> Some D
  | _ -> None

let initializeState (lines: string seq) =
  lines
  |> Seq.map (fun line -> line.Trim() |> Seq.filter (fun c -> c <> '#' && c <> '.') |> Seq.map parseLetter |> Seq.toList)
  |> Seq.filter (fun chars -> List.isEmpty chars |> not)
  |> Seq.toList
  |> List.transpose
  |> List.map Seq.toArray
  |> (function
      | [ a; b; c; d ] -> { roomA = a; roomB = b; roomC = c; roomD = d; hallway = Array.create 11 None }
      | _ -> failwith "couldn't find all the rooms in the input")

let part1 = File.ReadAllLines "../../input/2021/23.txt" |> Seq.toList
let part2 = part1 |> List.insertManyAt 3 [ "  #D#C#B#A#"; "  #D#B#A#C#" ]

dijkstra { state = initializeState part1; cost = 0 }
|> printfn "Part 1: %A"

dijkstra { state = initializeState part2; cost = 0 }
|> printfn "Part 2: %A"
