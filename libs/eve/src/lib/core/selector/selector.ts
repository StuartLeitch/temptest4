/**
 * Generic interface for a selector. The selector decides what the producer
 * will read from the source.
 */
export interface Selector<T> {
  /**
   * Method for determining if the producer should read the provided query.
   * @param query object or primitive that represents the query that a
   * producer runs to read an instance from the data source.
   */
  shouldSelect(query: T): boolean;

  /**
   * Method for filtering the appropriate queries from a list that the
   * producer will run for reading from the data source
   * @param queries List of queries provided by the producer.
   */
  select(queries: T[]): T[];
}
