#lang typed/racket
(require "../lib/parsing.rkt")

(define nums (file->lines->integers "../../input/2020/09.txt"))

(define interval 25)

(define (sum [xs : (Listof Integer)]) (apply + xs))

(define part1
  (for/fold ([answer : Integer 0]
             [pairs : (Listof (Listof Integer))
                     (combinations (take nums interval) 2)]
             #:result answer)
            ([num (drop nums interval)]
             [prev-num nums]
             #:final (not (member num (map sum pairs))))
    (values num
            (for/list ([pair pairs])
              (match pair
                 [(list a b) #:when (= a prev-num) (list b num)]
                 [else pair])))))

(displayln (format "Part 1: ~a" part1))

(define (part2)
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

  (search-up nums))

(match (part2)
  [(? number? answer) (displayln (format "Part 2: ~a" answer))])
