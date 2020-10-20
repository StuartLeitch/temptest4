export interface CreateTransactionRequestDTO {
  authorSurname?: string;
  authorCountry?: string;
  articleType?: string;
  authorEmail?: string;
  manuscriptId: string;
  journalId: string;
  created?: string;
  title?: string;
}
