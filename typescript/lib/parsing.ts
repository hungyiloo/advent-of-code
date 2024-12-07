// Splitting Structured Strings
const sss = {
  object<
  N1 extends Key, T1,
  N2 extends Key, T2,
  N3 extends Key, T3,
  N4 extends Key, T4,
  N5 extends Key, T5,
  N6 extends Key, T6,
  N7 extends Key, T7,
  N8 extends Key, T8,
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
      const result: Record<Key, unknown> = {}
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
    mapper: (s: string, index: number) => T = (s => s) as (s: string) => T,
  ) {
    const fn = (s: string) => s.split(separator).map(mapper);

    fn.nth = (n: number) => (s: string) => mapper(s.split(separator)[n], n)

    fn.slice = (start: number, end?: number) => (s: string) => s.split(separator).slice(start, end).map(mapper)

    fn.dict = <K extends Key, V>(keySelector: (x: T) => K, valueSelector: (x: T) => V) => 
      (s: string) => fn(s).reduce(
        (acc, curr) => {
          acc[keySelector(curr)] = valueSelector(curr);
          return acc;
        },
        {} as Record<K, V>,
      )

    fn.matches = (filter?: string | RegExp) => {
      if (!filter) {
        filter = separator
      }

      return (s: string) => s
        .split(separator)
        .filter(segment => {
          if (typeof filter === "string") {
            return segment === filter
          } else {
            return filter.test(segment)
          }
        })
        .map(mapper)
    }

    return fn
  },

  grid<T = string>(
    separator1: string | RegExp,
    separator2: string | RegExp,
    mapper: (s: string, x: number, y: number) => T = (s => s) as (s: string) => T,
  ) {
    return this.array(
      separator1,
      (row, x) => this.array(
        separator2,
        (cell, y) => mapper(cell, x, y)
      )(row)
    )
  },

  partition<N1 extends Key, T1, N2 extends Key, T2>(
    separator: string | RegExp,
    n1: N1, t1: ((x: string) => T1),
    n2: N2, t2: ((x: string) => T2),
  ) {
    return (s: string) => {
      const match = separator instanceof RegExp ? separator.exec(s) : undefined
      const partitionAt = typeof separator === "string" ? s.indexOf(separator) : match?.index
      if (partitionAt === -1 || partitionAt === undefined || partitionAt === null) {
        throw new Error(`Cannot partition by separator ${separator}`)
      }
      return {
        [n1]: t1(s.slice(0, partitionAt)),
        [n2]: t2(s.slice(partitionAt + (match?.[0].length ?? String(separator).length)))
      } as Record<N1, T1> & Record<N2, T2>
    }
  },

  tuple<T1, T2, T3, T4, T5, T6, T7, T8>(
    separator: string | RegExp,
    t1: null | ((x: string) => T1) = null,
    t2: null | ((x: string) => T2) = null,
    t3: null | ((x: string) => T3) = null,
    t4: null | ((x: string) => T4) = null,
    t5: null | ((x: string) => T5) = null,
    t6: null | ((x: string) => T6) = null,
    t7: null | ((x: string) => T7) = null,
    t8: null | ((x: string) => T8) = null,
  ) {
    return (s: string) => {
      const [v1, v2, v3, v4, v5, v6, v7, v8] = s.split(separator)
      if (t1) []
      const result = [
        t1?.(v1)!,
        t2?.(v2)!,
        t3?.(v3)!,
        t4?.(v4)!,
        t5?.(v5)!,
        t6?.(v6)!,
        t7?.(v7)!,
        t8?.(v8)!,
      ] as const
      const lastDefined = result.findLastIndex(x => x !== undefined)
      if (lastDefined !== -1) {
        return result.slice(0, lastDefined + 1) as unknown as typeof result
      } else {
        return result
      }
    }
  }
}
export default sss;

type Key = string | number | symbol;
