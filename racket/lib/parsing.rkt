#lang typed/racket

(provide string->exact-integer)
(: string->exact-integer (-> String Integer))
(define (string->exact-integer s)
  (assert (string->number s) exact-integer?))

(provide file->lines->integers)
(: file->lines->integers (-> String (Listof Integer)))
(define (file->lines->integers path)
  (map (lambda ([s : String])
         (assert (string->number s) exact-integer?))
       (file->lines path)))
