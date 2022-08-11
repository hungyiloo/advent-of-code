#lang typed/racket
(require "../lib/parsing.rkt")

(define adapters (sort (file->lines->integers "../../input/2020/10.txt") <))

(define differences
  (map
   (ann - (-> Integer Integer Integer))
   (append adapters (list (+ 3 (last adapters)))) ; built-in adapter is max + 3
   (cons 0 adapters))) ; charging outlet is always at 0

(define eq? (curry (ann = (-> Number Number Boolean))))

(define part1
  (* (count (eq? 1) differences)
     (count (eq? 3) differences)))

(displayln (format "Part 1: ~a" part1))

; lazy caterer's sequence
(: caterer (-> Integer Integer))
(define (caterer [n : Integer])
  (if (> n 0) (+ n (caterer (- n 1))) 1))

(: arrange (-> (Listof Integer) Integer))
(define (arrange xs)
  (match xs
    [(list 1 1 1 1 r ...) (* (caterer 3) (arrange r))]
    [(list 1 1 1 r ...) (* (caterer 2) (arrange r))]
    [(list 1 1 r ...) (* (caterer 1) (arrange r))]
    [(list _ r ...) (arrange r)]
    ['() 1]))

(define part2 (arrange differences))

(displayln (format "Part 2: ~a" part2))
