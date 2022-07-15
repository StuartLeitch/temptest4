export interface UpdateTransactionOnAcceptManuscriptDTO {
  authorsEmails: string[];
  manuscriptId: string;
  emailSenderInfo?: {
    address?: string;
    name?: string;
  };
  confirmationReminder: {
    queueName: string;
    delay: number;
  };
  bankTransferCopyReceiver?: string;
  sanctionedCountryNotificationReceiver?: string;
  sanctionedCountryNotificationSender?: string;
  acceptanceDate?: string;
}
