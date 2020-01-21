/**
 * Generic Interface for a consumer
 */

export interface Consumer<T> {
  /**
   * Method for getting an async iterator with all the objects from the store
   */
  getObjects(): AsyncGenerator<T, void, undefined>;
  /**
   * Method for setting the base object from which each instance in the iterator wil be extended from, a.k.a. adding custom constant fields.
   * @param base Object with the custom fields and their value
   */
  setBaseObject(base: object): void;
}
