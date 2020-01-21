/**
 * Generic Interface for a producer
 */
export interface Producer<T> {
  /**
   * Method for producing side-effects using an async generator as a data source
   * @param objects Data source for the side-effects
   */
  produce(objects: AsyncGenerator<T, void, undefined>): void;
}
