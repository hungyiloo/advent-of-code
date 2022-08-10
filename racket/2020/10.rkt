#lang typed/racket
(require "../lib/parsing.rkt")

(define adapters (sort (file->lines->integers "../../input/2020/10.txt") <))

(define differences
  (map
   (lambda ([a : Integer] [b : Integer]) (- b a))
   (cons 0 adapters) ; charging outlet is always at 0
   (append adapters (list (+ 3 (apply max adapters)))))) ; built-in adapter is max + 3

(define (eq [n : Integer])
  (lambda ([m : Integer]) (= n m)))

(define part1
  (* (count (eq 1) differences)
     (count (eq 3) differences)))

(displayln (format "Part 1: ~a" part1))

; lazy caterer's sequence
(define (caterer [n : Integer])
  (assert (+ 1 (/ (* n (+ n 1)) 2)) exact-integer?))

(: arrangements (-> (Listof Integer) Integer))
(define (arrangements xs)
  (match xs
    [(list a _ ..3 b r ...)
     #:when (<= (- b a) 4)
     (* (caterer 3) (arrangements r))]
    [(list a _ ..2 b r ...)
     #:when (<= (- b a) 3)
     (* (caterer 2) (arrangements r))]
    [(list a _ ..1 b r ...)
     #:when (<= (- b a) 2)
     (* (caterer 1) (arrangements r))]
    [(list _ r ...)
     (arrangements r)]
    ['() (caterer 0)]))

(define part2 (arrangements (cons 0 adapters)))

(displayln (format "Part 2: ~a" part2))
