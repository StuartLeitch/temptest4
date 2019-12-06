import { JournalEditorAssigned } from 'phenom-events';
import { Editor } from 'phenom-events/src/lib/editor';
import { CreateEditorDTO } from '../usecases/editorialBoards/createEditor/createEditorDTO';
import { EditorMap } from './EditorMap';

export class JournalEventMap {
  public static extractEditors(
    event: JournalEditorAssigned
  ): CreateEditorDTO[] {
    const scheduledEditorMap: { [key: string]: boolean } = {};
    const scheduledEditors: CreateEditorDTO[] = [];
    const editorsToParse: Editor[] = [];

    // parsing Journal Editors
    if (Array.isArray(event.editors)) {
      editorsToParse.push(...event.editors);
    }

    // parsing Journal Special Issue Editors
    if (Array.isArray(event.specialIssues)) {
      for (const specialIssue of event.specialIssues) {
        if (Array.isArray(specialIssue.editors)) {
          editorsToParse.push(...specialIssue.editors);
        }
      }
    }

    // parsing Journal Section Editors
    if (Array.isArray(event.sections)) {
      for (const section of event.sections) {
        // section.editors
        if (Array.isArray(section.editors)) {
          editorsToParse.push(...section.editors);
        }

        // section.specialIssues.editors
        if (Array.isArray(section.specialIssues)) {
          for (const sectionSpecialIssue of section.specialIssues) {
            if (Array.isArray(sectionSpecialIssue.editors)) {
              editorsToParse.push(...sectionSpecialIssue.editors);
            }
          }
        }
      }
    }

    for (const editor of editorsToParse) {
      const editorId = editor.id;
      const isScheduled = scheduledEditorMap[editorId];
      if (!isScheduled) {
        scheduledEditors.push(EditorMap.fromEventToDTO(editor));
        scheduledEditorMap[editorId] = true;
      }
    }

    return scheduledEditors;
  }
}
