export abstract class BaseMockEmailCommunicator {
  /**
   * Creates the database (schema).
   */
  public abstract sendEmail(message: any): Promise<void>;
}
