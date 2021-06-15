/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */
import {
  JournalSectionEditorAssigned,
  JournalEditorAssigned,
} from '@hindawi/phenom-events';

import {
  AssignEditorsToJournalUsecase,
  JournalEventMap,
} from '@hindawi/shared';

import { Context } from '../../builders';

import { HandlerFunction, EventHandler } from '../event-handler';

const JOURNAL_EDITOR_ASSIGNED = 'JournalEditorAssigned';
const JOURNAL_SECTION_EDITOR_ASSIGNED = 'JournalSectionEditorAssigned';

type EnvType = JournalSectionEditorAssigned | JournalEditorAssigned;

function addEditorEventHandlerFactory<T extends EnvType>(eventName: string) {
  return (context: Context): HandlerFunction<T> => {
    return async (data: T) => {
      const {
        repos: { catalog: catalogRepo, editor: editorRepo },
        services: { logger },
      } = context;

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
          logger.error(assignEditorResponse.value.message);
          throw assignEditorResponse.value;
        }

        logger.info(`Successfully executed event ${eventName}`);
      } catch (error) {
        logger.error(error.message);
        throw error;
      }
    };
  };
}

export const JournalEditorAssignedHandler: EventHandler<JournalEditorAssigned> = {
  event: JOURNAL_EDITOR_ASSIGNED,
  handler: addEditorEventHandlerFactory<JournalEditorAssigned>(
    JOURNAL_EDITOR_ASSIGNED
  ),
};

export const JournalSectionEditorAssignedHandler: EventHandler<JournalSectionEditorAssigned> = {
  event: JOURNAL_SECTION_EDITOR_ASSIGNED,
  handler: addEditorEventHandlerFactory<JournalSectionEditorAssigned>(
    JOURNAL_SECTION_EDITOR_ASSIGNED
  ),
};
