export interface UpdateTransactionOnAcceptManuscriptDTO {
  manuscriptId: string;
  authorsEmails: string[];
  customId?: string;
  title?: string;
  articleType?: string;
  correspondingAuthorEmail?: string;
  correspondingAuthorCountry?: string;
  correspondingAuthorSurname?: string;
  correspondingAuthorFirstName?: string;
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
