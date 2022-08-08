#lang typed/racket

; raco pkg install threading
(require threading)

(define-struct Slope ([right : Integer] [down : Integer]))

(define forest (file->lines "../../input/2020/03.txt"))

(define (hit-a-tree? [slope : Slope] [treeline : String] [line-number : Integer])
  (match (/ line-number (Slope-down slope))  ; get downward steps w.r.t. slope
    [(and (? positive? pos-down)
          (? exact-integer? pos-down))       ; check downward steps is a +ve int
     (~> (Slope-right slope)                 ; get the rightward slope
         (* pos-down)                        ; calculate rightward steps
         (modulo _ (string-length treeline)) ; account for repeating fores
         (string-ref treeline _)             ; get the data point for this posn
         (char=? #\#))]                      ; is it a tree?
    [else #f]))

(define (count-tree-hits [slope : Slope])
  (count (curry hit-a-tree? slope)
         forest
         (range (length forest))))

(~> (count-tree-hits (Slope 3 1))
    (format "Part 1: ~a" _)
    displayln)

(~> (map count-tree-hits (list (Slope 1 1)
                               (Slope 3 1)
                               (Slope 5 1)
                               (Slope 7 1)
                               (Slope 1 2)))
    (apply * _)
    (format "Part 2: ~a" _)
    displayln)
