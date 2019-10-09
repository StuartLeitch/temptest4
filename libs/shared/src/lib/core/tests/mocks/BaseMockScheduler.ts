export abstract class BaseMockScheduler {
  /**
   * Creates the database (schema).
   */
  public abstract async schedule(job: any): Promise<void>;
}
