export interface CreateEditorDTO {
  userId: string;
  editorId: string;
  journalId: string;
  name: string;
  email: string;
  roleLabel: string;
  roleType: string;
  createdAt?: Date;
  updatedAt?: Date;
}
