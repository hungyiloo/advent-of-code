#lang typed/racket
(require threading)
(require "../lib/parsing.rkt")
(require "../lib/lists.rkt")

(: nums (Listof Integer))
(define nums
  (~> (file->lines "../../input/2020/09.txt")
      (map string->exact-integer _)))

(define (sum [xs : (Listof Integer)]) (apply + xs))

(define part1 0)

(define interval 25)

(define combos (combinations (take nums interval) 2))

(for ([num (drop nums interval)]
      [prev-num nums]
      #:final (not (member num (map sum combos))))
  (set! part1 num)
  (set! combos
        (map
         (lambda ([pair : (Listof Integer)])
           (match pair
             [(list a b) #:when (= a prev-num) (list b num)]
             [else pair]))
         combos)))

(displayln (format "Part 1: ~a" part1))

(: part2 (U False Integer))
(define part2 #f)

(for ([i (range (length nums))]
      #:break part2)
  (define subtotal 0)
  (for ([j (range (+ i 1) (length nums))]
        #:break (or part2 (> subtotal part1)))
    (define subset (slice nums i j))
    (set! subtotal (sum subset))
    (when (= subtotal part1)
      (set! part2 (+ (apply min subset) (apply max subset))))))

(match part2
  [(? number?)
   (displayln (format "Part 2: ~a" part2))])
