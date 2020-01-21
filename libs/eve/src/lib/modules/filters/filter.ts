/**
 * Generic interface for a filter
 */
export interface Filter<T> {
  /**
   * Method for querying if an object matches the filter case
   * @param data value to be checked against the filter
   */
  match(data: T): boolean;
}
