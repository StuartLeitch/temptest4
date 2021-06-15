import { CreateEditorDTO } from '../createEditor/createEditorDTO';

export interface AssignEditorsToJournalDTO {
  allEditors: CreateEditorDTO[];
  journalId: string;
}
