export interface UpdateTransactionOnTADecisionDTO {
  manuscriptId: string;
  emailSenderInfo?: {
    address?: string;
    name?: string;
  };
  bankTransferCopyReceiver?: string;
  discount?: {
    percentageDiscount?: {
      value: number;
    };
  };
  submissionId?: string;
  invoiceId?: string;
}
