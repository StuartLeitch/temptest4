import { DeleteEditorDTO } from '../deleteEditor/deleteEditorDTO';

export interface RemoveEditorsFromJournalDTO {
  allEditors: DeleteEditorDTO[];
  journalId: string;
}
