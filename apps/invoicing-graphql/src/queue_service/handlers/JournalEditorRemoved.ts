/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

import { JournalEditorRemoved } from '@hindawi/phenom-events';

import {
  GetEditorsByJournalUsecase,
  AssignEditorsToJournalUsecase,
  RemoveEditorsFromJournalUsecase,
  EditorMap,
  JournalEventMap,
} from '@hindawi/shared';

const JOURNAL_EDITOR_REMOVED = 'JournalEditorRemoved';
const JOURNAL_SECTION_EDITOR_REMOVED = 'JournalSectionEditorRemoved';

function removeEditorEventHandlerFactory(eventName: string) {
  return async function (data: JournalEditorRemoved) {
    const {
      repos: { catalog: catalogRepo, editor: editorRepo },
      services: { logger },
    } = this;

    logger.setScope(`PhenomEvent:${eventName}`);
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
      const eventEditors = JournalEventMap.extractEditors(data);

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
        allEditors: eventEditors,
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

export const JournalSectionEditorRemovedHandler = {
  event: JOURNAL_SECTION_EDITOR_REMOVED,
  handler: removeEditorEventHandlerFactory(JOURNAL_SECTION_EDITOR_REMOVED),
};
