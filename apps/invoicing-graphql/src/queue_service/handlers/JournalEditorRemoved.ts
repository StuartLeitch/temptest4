/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

import { GetEditorsByJournalUsecase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/editorialBoards/getEditorsByJournal/getEditorsByJournal';
import { AssignEditorsToJournalUsecase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/editorialBoards/assignEditorsToJournal/assignEditorsToJournal';
import { RemoveEditorsFromJournalUsecase } from '../../../../../libs/shared/src/lib/modules/journals/usecases/editorialBoards/removeEditorsFromJournal/removeEditorsFromJournal';

import { EditorMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/EditorMap';

const JOURNAL_EDITOR_REMOVED = 'JournalEditorRemoved';

function removeEditorEventHandlerFactory(eventName: string): any {
  return async function (data: any) {
    const {
      repos: { catalog: catalogRepo, editor: editorRepo },
      // tslint:disable-next-line: no-shadowed-variable
      services: { logger },
    } = this;
    logger.setScope(`PhenomEvent:${JOURNAL_EDITOR_REMOVED}`);

    logger.info(`Incoming Event Data`, data);

    const getEditorsByJournal = new GetEditorsByJournalUsecase(
      editorRepo,
      catalogRepo
    );

    const removeEditorsFromJournal = new RemoveEditorsFromJournalUsecase(
      editorRepo,
      catalogRepo
    );

    const assignEditorsToJournal = new AssignEditorsToJournalUsecase(
      editorRepo,
      catalogRepo
    );

    try {
      const journalId = data.id;
      const eventEditors = [];

      if (data.editors && Array.isArray(data.editors)) {
        eventEditors.push(...data.editors);
      }

      // parsing Journal Section Editors
      if (data?.sections && Array.isArray(data.sections)) {
        for (const section of data.sections) {
          // section.editors
          if (Array.isArray(section.editors)) {
            eventEditors.push(...section.editors);
          }
        }
      }

      const allEditors = eventEditors.filter(
        (ee) => ee.roleType !== 'editorialAssistant'
      );

      const maybeCurrentEditors = await getEditorsByJournal.execute({
        journalId,
      });
      const currentEditorsResponse = maybeCurrentEditors.value;

      if (maybeCurrentEditors.isLeft()) {
        const err = currentEditorsResponse;
        logger.error(err);
        throw err;
      }

      const currentEditors = (currentEditorsResponse as any).map(
        EditorMap.toPersistence
      );

      const maybeEditorsRemoved = await removeEditorsFromJournal.execute({
        journalId,
        allEditors: currentEditors,
      });

      const editorsRemovedResponse = maybeEditorsRemoved.value;

      if (maybeEditorsRemoved.isLeft()) {
        logger.error(editorsRemovedResponse);
        throw editorsRemovedResponse;
      }

      const maybeAddEditorsToJournal = await assignEditorsToJournal.execute({
        journalId,
        allEditors,
      });

      const addEditorsToJournalResponse = maybeAddEditorsToJournal.value;
      if (maybeAddEditorsToJournal.isLeft()) {
        logger.error(addEditorsToJournalResponse);
        throw addEditorsToJournalResponse;
      }

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
