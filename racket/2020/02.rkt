#lang typed/racket
(require "../lib/parsing.rkt")

(define-type Policy (Integer Integer Char (Listof Char) -> Boolean))

; check a password definition (a line from the input) against a policy
(: check-password (Policy String -> Boolean))
(define (check-password policy? definition)
  (match (regexp-split #rx":?[ -]" definition)
    [(list pos1 pos2 letter password)
     (policy? (string->exact-integer pos1)
              (string->exact-integer pos2)
              (string-ref letter 0)
              (string->list password))]
    [else #f]))

(: part1-policy? Policy)
(define (part1-policy? pos1 pos2 letter password)
  (let ([occurrences (count (curry char=? letter) password)])
    (<= pos1 occurrences pos2)))

(: part2-policy? Policy)
(define (part2-policy? pos1 pos2 letter password)
  (define (password-char=? [letter : Char] [pos : Integer])
    (char=? letter (list-ref password (- pos 1))))
  (not (equal? (password-char=? letter pos1)
               (password-char=? letter pos2))))

(let ([definitions (file->lines "../../input/2020/02.txt")]
      [part1-checker (curry check-password part1-policy?)]
      [part2-checker (curry check-password part2-policy?)])
  (displayln (format "Part 1: ~a" (count part1-checker definitions)))
  (displayln (format "Part 2: ~a" (count part2-checker definitions))))
