export interface Selector<T> {
  shouldSelect(query: T): boolean;
  select(queries: T[]): T[];
}
