#lang typed/racket

(provide string->exact-integer)
(: string->exact-integer (-> String Integer))
(define (string->exact-integer s)
  (assert (string->number s) exact-integer?))
