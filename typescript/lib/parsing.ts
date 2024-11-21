// Splitting Structured Strings
const sss = {
  object<
  N1 extends key, T1,
  N2 extends key, T2,
  N3 extends key, T3,
  N4 extends key, T4,
  N5 extends key, T5,
  N6 extends key, T6,
  N7 extends key, T7,
  N8 extends key, T8,
  >(
    separator: string | RegExp,
    n1?: null | N1, t1?: null | ((x: string) => T1),
    n2?: null | N2, t2?: null | ((x: string) => T2),
    n3?: null | N3, t3?: null | ((x: string) => T3),
    n4?: null | N4, t4?: null | ((x: string) => T4),
    n5?: null | N5, t5?: null | ((x: string) => T5),
    n6?: null | N6, t6?: null | ((x: string) => T6),
    n7?: null | N7, t7?: null | ((x: string) => T7),
    n8?: null | N8, t8?: null | ((x: string) => T8),
  ) {
    return (s: string) => {
      const [v1, v2, v3, v4, v5, v6, v7, v8] = s.split(separator);
      const result: Record<key, unknown> = {}
      if (n1) result[n1] = t1?.(v1)
      if (n2) result[n2] = t2?.(v2)
      if (n3) result[n3] = t3?.(v3)
      if (n4) result[n4] = t4?.(v4)
      if (n5) result[n5] = t5?.(v5)
      if (n6) result[n6] = t6?.(v6)
      if (n7) result[n7] = t7?.(v7)
      if (n8) result[n8] = t8?.(v8)
      return result as 
        Record<N1, T1> &
        Record<N2, T2> &
        Record<N3, T3> &
        Record<N4, T4> &
        Record<N5, T5> &
        Record<N6, T6> &
        Record<N7, T7> &
        Record<N8, T8>;
    };
  },

  array<T = string>(
    separator: string | RegExp,
    mapper: (s: string) => T = (s => s) as (s: string) => T,
  ) {
    const fn = (s: string) => s.split(separator).map(mapper);

    fn.nth = (n: number) => (s: string) => mapper(s.split(separator)[n])

    fn.dict = <K extends key, V>(keySelector: (x: T) => K, valueSelector: (x: T) => V) => 
      (s: string) => 
        fn(s).reduce(
          (acc, curr) => {
            acc[keySelector(curr)] = valueSelector(curr);
            return acc;
          },
          {} as Record<K, V>,
        )

    return fn
  },

  tuple<T1, T2, T3, T4, T5, T6, T7, T8>(
    separator: string | RegExp,
    t1?: null | ((x: string) => T1),
    t2?: null | ((x: string) => T2),
    t3?: null | ((x: string) => T3),
    t4?: null | ((x: string) => T4),
    t5?: null | ((x: string) => T5),
    t6?: null | ((x: string) => T6),
    t7?: null | ((x: string) => T7),
    t8?: null | ((x: string) => T8),
  ) {
    return (s: string) => {
      const [v1, v2, v3, v4, v5, v6, v7, v8] = s.split(separator)
      return [
        t1?.(v1)!,
        t2?.(v2)!,
        t3?.(v3)!,
        t4?.(v4)!,
        t5?.(v5)!,
        t6?.(v6)!,
        t7?.(v7)!,
        t8?.(v8)!,
      ] as const
    }
  }
}
export default sss;

type key = string | number | symbol;
