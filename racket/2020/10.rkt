#lang typed/racket
(require "../lib/parsing.rkt")

(define adapters (sort (file->lines->integers "../../input/2020/10.txt") <))

(define differences
  (map
   (lambda ([a : Integer] [b : Integer]) (- b a))
   (cons 0 adapters)
   (append adapters (list (+ 3 (apply max adapters))))))

(define (eq [n : Integer])
  (lambda ([m : Integer]) (= n m)))

(define part1
  (* (count (eq 1) differences)
     (count (eq 3) differences)))

(displayln (format "Part 1: ~a" part1))

(: arrangements (-> Integer (Listof Integer) Integer))
(define (arrangements prev tail)
  ;; (displayln (list (reverse head) tail))
  (match tail
    ['() 1
     ;; (begin
     ;;   (displayln (reverse head))
     ;;   1)
     ]
    [(list-rest a b c r)
     #:when (and (<= (- a prev) 3) (<= (- b prev) 3) (<= (- c prev) 3))
     (+ (arrangements a (append (list b c) r))
        (arrangements b (cons c r))
        (arrangements c r))]
    [(list-rest a b r)
     #:when (and (<= (- a prev) 3) (<= (- b prev) 3))
     (+ (arrangements a (cons b r))
        (arrangements b r))]
    [(list-rest a r)
     (arrangements a r)]))

(define part2
  (arrangements 0 adapters))

(displayln (format "Part 2: ~a" part2))
