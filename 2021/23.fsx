#load "../lib/Memoization.fsx"
open Memoization
open System.IO
open System
open System.Collections.Generic

type Letter = A | B | C | D
type Position =
  | Hallway of int
  | Room of Letter * int
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
let roomOccupants room = room |> Array.choose id
let roomHasForeigners letter room = room |> Array.choose id |> Array.exists ((<>) letter)
let roomFirstOccupant room = room |> Array.mapi (fun i x -> match x with | Some l -> Some(i, l) | None -> None) |> Array.tryPick id
let roomFirstVacancy room = room |> Array.mapi (fun i x -> match x with | None -> Some(i) | Some _ -> None) |> Array.rev |> Array.tryPick id
let win (state: GameState) = [ A; B; C; D ] |> List.forall (fun letter -> getRoom state letter |> roomWin letter)
let hallwayPlace = function | A -> 2 | B -> 4 | C -> 6 | D -> 8
let energy = function | A -> 1 | B -> 10 | C -> 100 | D -> 1000
let clone state = { roomA = state.roomA.[*]; roomB = state.roomB.[*]; roomC = state.roomC.[*]; roomD = state.roomD.[*]; hallway = state.hallway.[*] }

let getCost letter currentPosition targetPosition =
  energy letter *
  match currentPosition, targetPosition with
  | Hallway place1, Hallway place2 -> (abs (place1 - place2))
  | Room(room, depth), Hallway place
  | Hallway place, Room(room, depth) -> (abs (place - hallwayPlace room)) + depth + 1
  | Room(room1, depth1), Room(room2, depth2) -> (abs (hallwayPlace room1 - hallwayPlace room2)) + depth1 + depth2 + 2

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
              |> List.filter (isHallwayBlocked state (hallwayPlace roomLetter) >> not)
              |> List.map
                (fun place ->
                  let nextState = clone state
                    // match roomLetter with
                    // | A -> { roomA = state.roomA.[*]; roomB = state.roomB; roomC = state.roomC; roomD = state.roomD; hallway = state.hallway.[*] }
                    // | B -> { roomA = state.roomA; roomB = state.roomB.[*]; roomC = state.roomC; roomD = state.roomD; hallway = state.hallway.[*] }
                    // | C -> { roomA = state.roomA; roomB = state.roomB; roomC = state.roomC.[*]; roomD = state.roomD; hallway = state.hallway.[*] }
                    // | D -> { roomA = state.roomA; roomB = state.roomB; roomC = state.roomC; roomD = state.roomD.[*]; hallway = state.hallway.[*] }
                  let room = getRoom nextState roomLetter
                  room.[position] <- None
                  nextState.hallway.[place] <- Some letter
                  let additionalCost = getCost letter (Room(roomLetter, position)) (Hallway place)
                  nextState, additionalCost))
      let hallwayMoves =
        validHallwayPlaces
        |> Seq.choose
          (fun place ->
            match state.hallway.[place] with
            | None -> None
            | Some letter ->
              let targetPlace = hallwayPlace letter
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
                    // match letter with
                    // | A -> { roomA = state.roomA.[*]; roomB = state.roomB; roomC = state.roomC; roomD = state.roomD; hallway = state.hallway.[*] }
                    // | B -> { roomA = state.roomA; roomB = state.roomB.[*]; roomC = state.roomC; roomD = state.roomD; hallway = state.hallway.[*] }
                    // | C -> { roomA = state.roomA; roomB = state.roomB; roomC = state.roomC.[*]; roomD = state.roomD; hallway = state.hallway.[*] }
                    // | D -> { roomA = state.roomA; roomB = state.roomB; roomC = state.roomC; roomD = state.roomD.[*]; hallway = state.hallway.[*] }
                  nextState.hallway.[place] <- None
                  let targetRoom = getRoom nextState letter
                  match roomFirstVacancy targetRoom with
                  | Some vacantPosition ->
                    targetRoom.[vacantPosition] <- Some letter
                    let additionalCost = getCost letter (Hallway place) (Room(letter, vacantPosition))
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
    // printfn "PQ: %A" (List.length pq)
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
         | true, lastCost when lastCost <= nextCost -> pq
         | true, _ ->
           costs.[state] <- nextCost
           let pq = pq |> List.filter (fun o -> o.state <> state)
           insertByCost pq { state = state; cost = nextCost }
         | false, _ ->
           costs.[state] <- nextCost
           insertByCost pq { state = state; cost = nextCost })

  let mutable count = 0
  let rec search pq =
    let bestOutcome = List.head pq
    count <- count + 1
    if count % 1000 = 0 then
      printfn "%A" count
      printfn "%A" bestOutcome
    if win bestOutcome.state
    then bestOutcome.cost
    else search (explore pq)

  search [start]

let parseLetter = function | "A" -> A | "B" -> B | "C" -> C | "D" -> D | _ -> failwith "Invalid amphipod letter"

let init =
  File.ReadAllLines "23.input.txt"
  |> Seq.fold
    (fun state line ->
      match line.Split([|"#"|], StringSplitOptions.RemoveEmptyEntries) with
      | [| a; b; c; d |] ->
        state.roomA.[0] <- Some(parseLetter a)
        state.roomB.[0] <- Some(parseLetter b)
        state.roomC.[0] <- Some(parseLetter c)
        state.roomD.[0] <- Some(parseLetter d)
        state
      | [| "  "; a; b; c; d; "  " |]
      | [| "  "; a; b; c; d; |] ->
        state.roomA.[1] <- Some(parseLetter a)
        state.roomB.[1] <- Some(parseLetter b)
        state.roomC.[1] <- Some(parseLetter c)
        state.roomD.[1] <- Some(parseLetter d)
        state
      | _ -> state)
    { roomA = Array.create 2 None; roomB = Array.create 2 None; roomC = Array.create 2 None; roomD = Array.create 2 None; hallway = Array.create 11 None }
  |> (fun state -> { state = state; cost = 0 })

dijkstra init
// nextStates init.state
// |> Seq.item 15
// |> fst
// |> nextStates
// |> Seq.length
// |> (fun os -> List.head os |> nextOutcomes)
// |> (fun os -> List.head os |> nextOutcomes)
// |> (fun os -> List.head os |> nextOutcomes)
// |> (fun os -> List.head os |> nextOutcomes)
// |> (fun os -> List.head os |> nextOutcomes)
|> printfn "%A"
