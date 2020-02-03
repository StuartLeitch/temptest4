/**
 * Generic Interface for a consumer.
 */
export interface Consumer<T> {
    /**
     * Method for producing side-effects using the provided data.
     * @param objects Data source for the side-effects.
     */
    consume(objects: T[] | T): void;
}
