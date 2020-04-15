import { Selector } from '../selector';
import { Filter } from '../filters';

/**
 * Generic Interface for a producer
 */
export interface Producer<T, U> {
  /**
   * Method for getting an async iterator with all the objects from the store.
   */
  produce(): AsyncGenerator<T | T[], void, undefined>;

  /**
   * Method for setting the base object from which each instance in the
   * iterator will be extended from, a.k.a. adding custom constant fields.
   * @param base Object with the custom fields and their value
   */
  setDefaultValues(base: Partial<T>): void;

  /**
   * Method for adding filters for the emitted data
   * @param filter Class that implements the Filter interface for type T.
   */
  addFilter(filter: Filter<T>): void;

  /**
   * Method for removing all the filters.
   */
  removeFilters(): void;

  /**
   * Method for adding selector
   * @param selector Class that implements the Selector interface for the type
   * used by the data source
   */
  addSelector(selector: Selector<U>): void;

  /**
   * Method for removing all selectors
   */
  removeSelectors(): void;
}
