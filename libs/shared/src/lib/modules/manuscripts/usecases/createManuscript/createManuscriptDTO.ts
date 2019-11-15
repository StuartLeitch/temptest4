export interface CreateManuscriptDTO {
  manuscriptId: string;
  customId: string;
  journalId: string;
  title: string;
  articleTypeId: string;
  authorEmail: string;
  authorCountry: string;
  authorSurname: string;
  created: Date;
}
