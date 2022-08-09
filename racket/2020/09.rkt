#lang typed/racket
(require "../lib/parsing.rkt")

(define nums (file->lines->integers "../../input/2020/09.txt"))

(define interval 25)

(define (sum [xs : (Listof Integer)]) (apply + xs))

(: xmas (-> (Listof Integer) (Listof Integer) (U False Integer)))
(define (xmas preamble queue)
  (define n (car queue))
  (define sums (map sum (combinations preamble 2)))
  (cond
    [(empty? queue) #f]
    [(member n sums)
     (xmas (append (drop preamble 1) (list n))
           (cdr queue))]
    [else n]))

(define part1
  (let ([preamble (take nums interval)]
        [queue (drop nums interval)])
    (assert (xmas preamble queue) number?)))

(: search-inside (-> (Listof Integer) (Listof Integer) (U False Integer)))
(define (search-inside xs ys)
  (define subtotal (sum xs))
  (cond
    [(= subtotal part1) (+ (apply min xs) (apply max xs))]
    [(> subtotal part1) #f]
    [(empty? ys) #f]
    [else (search-inside (cons (car ys) xs) (cdr ys))]))

(: search-up (-> (Listof Integer) (U False Integer)))
(define (search-up [xs : (Listof Integer)])
  (or (search-inside '() xs)
      (search-up (cdr xs))))

(define part2 (assert (search-up nums) number?))

(displayln (format "Part 1: ~a" part1))
(displayln (format "Part 2: ~a" part2))
