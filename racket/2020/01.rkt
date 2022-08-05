#lang racket

; does a list of numbers sum to a total of 2020?
(define (sums-to-2020? nums)
  (= 2020 (apply + nums)))

(let* ([lines (file->lines "../../input/2020/01.txt")]
       [nums (map string->number lines)]
       [pairs (cartesian-product nums nums)]
       [triplets (cartesian-product nums nums nums)]
       [part1 (apply * (findf sums-to-2020? pairs))]
       [part2 (apply * (findf sums-to-2020? triplets))])
  (displayln (format "Part 1: ~a" part1))
  (displayln (format "Part 2: ~a" part2)))
