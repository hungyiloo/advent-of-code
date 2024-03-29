export function pipe<T>(
  input: T,
): T;
export function pipe<T, A>(
  input: T,
  op1: (x: T) => A,
): A;
export function pipe<T, A, B>(
  input: T,
  op1: (x: T) => A,
  op2: (x: A) => B,
): B;
export function pipe<T, A, B, C>(
  input: T,
  op1: (x: T) => A,
  op2: (x: A) => B,
  op3: (x: B) => C,
): C;
export function pipe<T, A, B, C, D>(
  input: T,
  op1: (x: T) => A,
  op2: (x: A) => B,
  op3: (x: B) => C,
  op4: (x: C) => D,
): D;
export function pipe<T, A, B, C, D, E>(
  input: T,
  op1: (x: T) => A,
  op2: (x: A) => B,
  op3: (x: B) => C,
  op4: (x: C) => D,
  op5: (x: D) => E,
): E;
export function pipe<T, A, B, C, D, E, F>(
  input: T,
  op1: (x: T) => A,
  op2: (x: A) => B,
  op3: (x: B) => C,
  op4: (x: C) => D,
  op5: (x: D) => E,
  op6: (x: E) => F,
): F;
export function pipe<T, A, B, C, D, E, F, G>(
  input: T,
  op1: (x: T) => A,
  op2: (x: A) => B,
  op3: (x: B) => C,
  op4: (x: C) => D,
  op5: (x: D) => E,
  op6: (x: E) => F,
  op7: (x: F) => G,
): G;
export function pipe<T, A, B, C, D, E, F, G, H>(
  input: T,
  op1: (x: T) => A,
  op2: (x: A) => B,
  op3: (x: B) => C,
  op4: (x: C) => D,
  op5: (x: D) => E,
  op6: (x: E) => F,
  op7: (x: F) => G,
  op8: (x: G) => H,
): H;
// deno-lint-ignore no-explicit-any
export function pipe<T>(input: T, ...ops: ((x: any) => any)[]) {
  return ops.length > 0
    ? ops.reduce((result, op) => op(result), input)
    : input;
}
