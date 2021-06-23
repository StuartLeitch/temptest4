export interface CreateTransactionDTO {
  authorsEmails: string[];
  manuscriptId: string;
  journalId: string;
  created?: string;
}
