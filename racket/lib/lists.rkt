#lang typed/racket

(provide slice)
(: slice (All (a) (-> (Listof a) Integer Integer (Listof a))))
(define (slice xs start end)
  (take (drop xs start) (- end start)))
