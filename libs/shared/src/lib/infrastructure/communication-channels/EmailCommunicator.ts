export interface EmailCommunicator {
  sendEmail(message: any): Promise<void>;
}
