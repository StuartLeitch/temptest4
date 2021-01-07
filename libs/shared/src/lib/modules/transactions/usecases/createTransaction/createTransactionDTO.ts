export interface CreateTransactionRequestDTO {
  authorsEmails: string[];
  manuscriptId: string;
  journalId: string;
  created?: string;
}
