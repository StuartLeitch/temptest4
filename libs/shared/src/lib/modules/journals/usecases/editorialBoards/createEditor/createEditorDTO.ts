export interface CreateEditorDTO {
  userId: string;
  editorId: string;
  journalId: string;
  name: string;
  givenNames?: string;
  surname?: string;
  email: string;
  role?: any;
  roleLabel: string;
  roleType: string;
  createdAt?: Date;
  updatedAt?: Date;
}
