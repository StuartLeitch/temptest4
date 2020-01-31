/**
 * Generic interface for filtering what data will be emitted by the producer.
 */
export interface Filter<T> {
    /**
     * Method for querying if an object matches the filter case.
     * @param data value to be checked against the filter.
     */
    match(data: T): boolean;
}
