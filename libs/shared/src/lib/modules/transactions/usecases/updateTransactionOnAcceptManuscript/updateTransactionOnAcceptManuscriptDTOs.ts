export interface UpdateTransactionOnAcceptManuscriptDTO {
  manuscriptId: string;
  customId?: string;
  title?: string;
  articleType?: string;
  authorEmail?: string;
  authorCountry?: string;
  authorSurname?: string;
  authorFirstName?: string;
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
}
