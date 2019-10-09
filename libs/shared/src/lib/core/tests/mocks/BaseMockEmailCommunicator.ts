export abstract class BaseMockEmailCommunicator {
  /**
   * Creates the database (schema).
   */
  public abstract async sendEmail(message: any): Promise<void>;
}
