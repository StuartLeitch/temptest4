export interface UpdateTransactionOnTADecisionDTO {
  manuscriptId: string;
  emailSenderInfo?: {
    address?: string;
    name?: string;
  };
  bankTransferCopyReceiver?: string;
  discount?: number;
  submissionId?: string;
}
