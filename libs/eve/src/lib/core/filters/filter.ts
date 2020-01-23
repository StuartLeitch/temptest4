/**
 * Generic interface for filtering data that matches specific conditions
 */
export interface Filter<T> {
  /**
   * Method for querying if an object matches the filter case
   * @param data value to be checked against the filter
   */
  match(data: T): boolean;
}
