export abstract class BaseMockScheduler {
  /**
   * Creates the database (schema).
   */
  public abstract schedule(job: any): Promise<void>;
}
