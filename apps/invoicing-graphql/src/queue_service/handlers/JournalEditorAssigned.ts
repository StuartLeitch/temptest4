/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

import {
  AssignEditorsToJournalUsecase,
  JournalEventMap,
} from '@hindawi/shared';

const JOURNAL_EDITOR_ASSIGNED = 'JournalEditorAssigned';
const JOURNAL_SECTION_EDITOR_ASSIGNED = 'JournalSectionEditorAssigned';

function addEditorEventHandlerFactory(eventName: string): any {
  return async function (data: any) {
    const {
      repos: { catalog: catalogRepo, editor: editorRepo },
      services: { logger },
    } = this;

    logger.setScope(`PhenomEvent:${eventName}`);
    logger.info(`Incoming Event Data`, data);

    const assignEditorToJournal = new AssignEditorsToJournalUsecase(
      editorRepo,
      catalogRepo
    );

    try {
      const journalId = data.id;
      const editors = JournalEventMap.extractEditors(data);
      const assignEditorResponse = await assignEditorToJournal.execute({
        journalId,
        allEditors: editors,
      });

      if (assignEditorResponse.isLeft()) {
        logger.error(assignEditorResponse.value.errorValue().message);
        throw assignEditorResponse.value.error;
      }

      logger.info(`Successfully executed event ${eventName}`);
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  };
}

export const JournalEditorAssignedHandler = {
  event: JOURNAL_EDITOR_ASSIGNED,
  handler: addEditorEventHandlerFactory(JOURNAL_EDITOR_ASSIGNED),
};

export const JournalSectionEditorAssignedHandler = {
  event: JOURNAL_SECTION_EDITOR_ASSIGNED,
  handler: addEditorEventHandlerFactory(JOURNAL_SECTION_EDITOR_ASSIGNED),
};
