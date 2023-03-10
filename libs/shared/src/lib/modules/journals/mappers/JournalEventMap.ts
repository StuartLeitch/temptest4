import { Editor } from '@hindawi/phenom-events/src/lib/editor';
import {
  JournalSectionEditorAssigned,
  JournalEditorAssigned,
} from '@hindawi/phenom-events';

import { CreateEditorDTO } from '../usecases/editorialBoards/createEditor/createEditorDTO';

import { EditorMap } from './EditorMap';

export class JournalEventMap {
  public static extractEditors(
    event: JournalSectionEditorAssigned | JournalEditorAssigned
  ): CreateEditorDTO[] {
    const scheduledEditorMap: { [key: string]: boolean } = {};
    const scheduledEditors: CreateEditorDTO[] = [];
    const editorsToParse: Editor[] = [];

    // parsing Journal Editors
    if (Array.isArray(event.editors)) {
      editorsToParse.push(...event.editors);
    }

    // parsing Journal Section Editors
    if (Array.isArray(event.sections)) {
      for (const section of event.sections) {
        // section.editors
        if (Array.isArray(section.editors)) {
          editorsToParse.push(...section.editors);
        }
      }
    }

    // Removed section editors/special issue editors
    for (const editor of editorsToParse) {
      const editorId = editor.id;
      const isScheduled = scheduledEditorMap[editorId];
      if (!isScheduled && editor?.role?.type !== 'editorialAssistant') {
        scheduledEditors.push(EditorMap.fromEventToDTO(editor));
        scheduledEditorMap[editorId] = true;
      }
    }

    return scheduledEditors;
  }
}
