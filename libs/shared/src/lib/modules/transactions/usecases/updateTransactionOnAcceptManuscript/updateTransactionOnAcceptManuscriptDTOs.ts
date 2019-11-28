export interface UpdateTransactionOnAcceptManuscriptDTO {
  manuscriptId: string;
  customId?: string;
  title?: string;
  articleType?: string;
  authorEmail?: string;
  authorCountry?: string;
  authorSurname?: string;
  authorFirstName?: string;
  paymentApplicationLink?: string;
}
