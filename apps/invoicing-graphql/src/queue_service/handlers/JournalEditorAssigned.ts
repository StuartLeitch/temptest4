import { AssignEditorsToJournalUsecase } from 'libs/shared/src/lib/modules/journals/usecases/editorialBoards/assignEditorsToJournal/assignEditorsToJournal';
import { Context } from '@hindawi/invoicing-graphql/context';
import { JournalEventMap } from 'libs/shared/src/lib/modules/journals/mappers/JournalEventMap';

const JOURNAL_EDITOR_ASSIGNED = 'JournalEditorAssigned';
const JOURNAL_SECTION_SPECIAL_ISSUE_EDITOR_ASSIGNED =
  'JournalSectionSpecialIssueEditorAssigned';
const JOURNAL_SECTION_EDITOR_ASSIGNED = 'JournalSectionEditorAssigned';
const JOURNAL_SPECIAL_ISSUE_EDITOR_ASSIGNED = 'JournalSpecialIssueEditorAssigned';

export const JournalEditorAssignedHandler = {
  event: JOURNAL_EDITOR_ASSIGNED,
  handler: addEditorEventHandlerFactory(JOURNAL_EDITOR_ASSIGNED)
};

// Removed, we do not treat assistants/special issue editors/section editors as journal editors
// export const JournalSectionSpecialIssueEditorAssignedHandler = {
//   event: JOURNAL_SECTION_SPECIAL_ISSUE_EDITOR_ASSIGNED,
//   handler: addEditorEventHandlerFactory(JOURNAL_SECTION_SPECIAL_ISSUE_EDITOR_ASSIGNED)
// };

// export const JournalSectionEditorAssignedHandler = {
//   event: JOURNAL_SECTION_EDITOR_ASSIGNED,
//   handler: addEditorEventHandlerFactory(JOURNAL_SECTION_EDITOR_ASSIGNED)
// };

// export const JournalSpecialIssueEditorAssignedHandler = {
//   event: JOURNAL_SPECIAL_ISSUE_EDITOR_ASSIGNED,
//   handler: addEditorEventHandlerFactory(JOURNAL_SPECIAL_ISSUE_EDITOR_ASSIGNED)
// };

function addEditorEventHandlerFactory(eventName: string):any {
  return async function(data: any) {
    console.log(`
[${eventName} Incoming Event Data]:
${JSON.stringify(data)}`);
    const {
      repos: { catalog: catalogRepo, editor: editorRepo }
    } = this as Context;

    const assignEditorToJournal = new AssignEditorsToJournalUsecase(
      editorRepo,
      catalogRepo
    );

    try {
      let journalId = data.id;
      let editors = JournalEventMap.extractEditors(data);
      const assignEditorResponse = await assignEditorToJournal.execute({
        journalId,
        allEditors: editors
      });
      if (assignEditorResponse.isLeft()) {
        console.error(assignEditorResponse.value.error);
      }
      console.log(`Successfully exectued event ${eventName}`)
    } catch (error) {
      console.error(error);
    }
  }
}

