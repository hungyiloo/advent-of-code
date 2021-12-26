#load "../lib/Memoization.fsx"
open Memoization
open System.Collections.Generic

type Letter = A | B | C | D
type GameState = { roomA: Option<Letter> array; roomB: Option<Letter> array; roomC: Option<Letter> array; roomD: Option<Letter> array; hallway: Option<Letter> array }
type Outcome = { state: GameState; cost: int }
let validHallwayPlaces = [ 0; 1; 3; 5; 7; 9; 10 ]
let letters = [ A; B; C; D ]

let isHallwayBlocked (state: GameState) fromPlace toPlace =
  validHallwayPlaces
  |> List.filter (fun p -> (fromPlace < p && p <= toPlace) || (toPlace <= p && p < fromPlace))
  |> List.exists (fun p -> match state.hallway.[p] with | Some _ -> true | None -> false)

let getRoom (state: GameState) (room: Letter) =
  match room with
  | A -> state.roomA
  | B -> state.roomB
  | C -> state.roomC
  | D -> state.roomD

let roomWin letter room = room |> Array.forall ((=) (Some letter))
let roomHasForeigners letter room = room |> Array.choose id |> Array.exists ((<>) letter)
let roomFirstOccupant room = room |> Array.mapi (fun i x -> match x with | Some l -> Some(i, l) | None -> None) |> Array.tryPick id
let roomFirstVacancy room = room |> Array.mapi (fun i x -> match x with | None -> Some(i) | Some _ -> None) |> Array.rev |> Array.tryPick id
let win (state: GameState) = [ A; B; C; D ] |> List.forall (fun letter -> getRoom state letter |> roomWin letter)
let getRoomHallwayPlace = function | A -> 2 | B -> 4 | C -> 6 | D -> 8
let energy = function | A -> 1 | B -> 10 | C -> 100 | D -> 1000
let clone state = { roomA = state.roomA.[*]; roomB = state.roomB.[*]; roomC = state.roomC.[*]; roomD = state.roomD.[*]; hallway = state.hallway.[*] }
let getCost letter room depth hallwayPlace  = energy letter * ((abs (hallwayPlace - getRoomHallwayPlace room)) + depth + 1)

let nextStates =
  memoize
    (fun (state: GameState) ->
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
            | Some(position, letter) ->
              validHallwayPlaces
              |> List.filter (isHallwayBlocked state (getRoomHallwayPlace roomLetter) >> not)
              |> List.map
                (fun place ->
                  let nextState = clone state
                  let room = getRoom nextState roomLetter
                  room.[position] <- None
                  nextState.hallway.[place] <- Some letter
                  let additionalCost = getCost letter roomLetter position place
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
                  match roomFirstVacancy targetRoom with
                  | Some vacantPosition ->
                    targetRoom.[vacantPosition] <- Some letter
                    let additionalCost = getCost letter letter vacantPosition place
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

let part1 =
  { state =
      { roomA = [| Some B; Some C |]
        roomB = [| Some B; Some A |]
        roomC = [| Some D; Some D |]
        roomD = [| Some A; Some C |]
        hallway = Array.create 11 None }
    cost = 0 }
dijkstra part1 |> printfn "Part 1: %A"

let part2 =
  { state =
      { roomA = [| Some B; Some D; Some D; Some C |]
        roomB = [| Some B; Some C; Some B; Some A |]
        roomC = [| Some D; Some B; Some A; Some D |]
        roomD = [| Some A; Some A; Some C; Some C |]
        hallway = Array.create 11 None }
    cost = 0 }
dijkstra part2 |> printfn "Part 2: %A"
