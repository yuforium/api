export type DtoType<T> = {
  [K in keyof T as (T[K] extends (...args: any[]) => any ? never : K)]: T[K]
}
