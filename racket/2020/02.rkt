#lang racket

; check a password definition (a line from the input) against a policy
(define (check-password policy? definition)
  (match (regexp-split #rx":?[ -]" definition)
    [(list pos1 pos2 letter password)
     (let ([pos1 (string->number pos1)]
           [pos2 (string->number pos2)]
           [letter (string-ref letter 0)]
           [password (string->list password)])
       (policy? pos1 pos2 letter password))]
    [else #f]))

(define (part1-policy? pos1 pos2 letter password)
  (let ([occurrences (count (curry char=? letter) password)])
    (<= pos1 occurrences pos2)))

(define (part2-policy? pos1 pos2 letter password)
  (define (password-char=? letter pos)
    (char=? letter (list-ref password (- pos 1))))
  (xor (password-char=? letter pos1)
       (password-char=? letter pos2)))

(let ([definitions (file->lines "../../input/2020/02.txt")]
      [part1-checker (curry check-password part1-policy?)]
      [part2-checker (curry check-password part2-policy?)])
  (displayln (format "Part 1: ~a" (count part1-checker definitions)))
  (displayln (format "Part 2: ~a" (count part2-checker definitions))))
