#lang typed/racket
(require "../lib/parsing.rkt")

; does a list of numbers sum to a total of 2020?
(define (sums-to-2020? [nums : (Listof Number)])
  (= 2020 (apply + nums)))

(let* ([nums (file->lines->integers "../../input/2020/01.txt")]
       [pairs (combinations nums 2)]
       [triplets (combinations nums 3)]
       [part1 (match (findf sums-to-2020? pairs)
                [(list a b) (* a b)])]
       [part2 (match (findf sums-to-2020? triplets)
                [(list a b c) (* a b c)])])
  (displayln (format "Part 1: ~a" part1))
  (displayln (format "Part 2: ~a" part2)))
