export interface EditManuscriptDTO {
  journalId?: string;
  manuscriptId: string;
  customId?: string;
  title?: string;
  articleType?: string;
  authorEmail?: string;
  authorCountry?: string;
  authorSurname?: string;
  authorFirstName?: string;
  arxivId?: string;
}
