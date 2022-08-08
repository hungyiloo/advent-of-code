#lang typed/racket
(require threading)
(require "../lib/parsing.rkt")
(require "../lib/lists.rkt")

(define nums
  (~> (file->lines "../../input/2020/09.txt")
      (map string->exact-integer _)))

(define interval 25)

(define (sum [xs : (Listof Integer)]) (apply + xs))

(define part1
  (for/fold ([answer : Integer 0]
             [combos : (Listof (Listof Integer))
                     (combinations (take nums interval) 2)]
             #:result answer)
            ([num (drop nums interval)]
             [prev-num nums]
             #:final (not (member num (map sum combos))))
    (values num
            (for/list ([combo combos])
              (match combo
                 [(list a b) #:when (= a prev-num) (list b num)]
                 [else combo])))))

(displayln (format "Part 1: ~a" part1))

(define part2
  (for/or ([i (range (length nums))])
    : (U False Integer)
    (for/fold ([subtotal : Integer 0]
               [part2 : (U False Integer) #f]
               #:result part2)
              ([j (range (+ i 1) (length nums))]
               #:break (or part2 (> subtotal part1)))
      (define subset (slice nums i j))
      (values (sum subset)
              (if (= subtotal part1)
                  (+ (apply min subset) (apply max subset))
                  part2)))))

(match part2
  [(? number?)
   (displayln (format "Part 2: ~a" part2))])
