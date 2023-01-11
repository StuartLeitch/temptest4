export interface UpdateTransactionOnTADecisionDTO {
  authorEmails: string[];
  manuscriptId: string;
  emailSenderInfo?: {
    address?: string;
    name?: string;
  };
  bankTransferCopyReceiver?: string;
  discount?: {
    currency: string;
    value: number;
    taCode: string;
  };
  submissionId?: string;
  invoiceId?: string;
  sanctionedCountryNotificationReceiver?: string;
  sanctionedCountryNotificationSender?: string;
}
