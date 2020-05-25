export interface DeleteEditorDTO {
  editorId: string;
  userId: string;
  journalId: string;
  name: string;
  email: string;
  roleLabel: string;
  roleType: string;
  createdAt?: Date;
  updatedAt?: Date;
}
