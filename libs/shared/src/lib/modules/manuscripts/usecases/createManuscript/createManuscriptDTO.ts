export interface CreateManuscriptDTO {
  id: string;
  customId: string;
  journalId: string;
  title: string;
  articleType: string;
  authorEmail: string;
  authorCountry: string;
  authorSurname: string;
  authorFirstName: string;
  created: Date;
  preprintValue: string;
  is_cascaded: number;
}
