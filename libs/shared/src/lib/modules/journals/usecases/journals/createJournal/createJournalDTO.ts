export interface CreateJournalDTO {
  name: string;
  email: string;
  issn: string;
  code: string;
  articleProcessingCharge: number;
  isActive: boolean;
  activationDate?: Date;
}
