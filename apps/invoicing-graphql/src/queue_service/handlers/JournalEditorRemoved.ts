/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

// import { AssignEditorsToJournalUsecase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/editorialBoards/assignEditorsToJournal/assignEditorsToJournal';
import { RemoveEditorsFromJournalUsecase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/editorialBoards/removeEditorsFromJournal/removeEditorsFromJournal';
import { JournalEventMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/JournalEventMap';
import { Logger } from '../../lib/logger';

const JOURNAL_EDITOR_REMOVED = 'JournalEditorRemoved';
const logger = new Logger(`PhenomEvent:${JOURNAL_EDITOR_REMOVED}`);
// const JOURNAL_SECTION_SPECIAL_ISSUE_EDITOR_ASSIGNED =
//   'JournalSectionSpecialIssueEditorAssigned';
// const JOURNAL_SECTION_EDITOR_ASSIGNED = 'JournalSectionEditorAssigned';
// const JOURNAL_SPECIAL_ISSUE_EDITOR_ASSIGNED =
//   'JournalSpecialIssueEditorAssigned';

function removeEditorEventHandlerFactory(eventName: string): any {
  return async function (data: any) {
    logger.info(`Incoming Event Data`, data);
    const {
      repos: { catalog: catalogRepo, editor: editorRepo },
    } = this;

    const removeEditorsFromJournal = new RemoveEditorsFromJournalUsecase(
      editorRepo,
      catalogRepo
    );

    try {
      const journalId = data.id;
      const editors = JournalEventMap.extractEditors(data);
      const editorsRemovedResponse = await removeEditorsFromJournal.execute({
        journalId,
        allEditors: editors,
      });

      // if (editorsRemovedResponse.isLeft()) {
      //   logger.error(editorsRemovedResponse.value.errorValue().message);
      //   throw editorsRemovedResponse.value.error;
      // }

      logger.info(`Successfully executed event ${eventName}`);
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  };
}

export const JournalEditorRemovedHandler = {
  event: JOURNAL_EDITOR_REMOVED,
  handler: removeEditorEventHandlerFactory(JOURNAL_EDITOR_REMOVED),
};
