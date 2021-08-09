/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

import {
  JournalSectionEditorRemoved,
  JournalEditorRemoved,
} from '@hindawi/phenom-events';

import {
  GetEditorsByJournalUsecase,
  AssignEditorsToJournalUsecase,
  RemoveEditorsFromJournalUsecase,
  EditorMap,
  JournalEventMap,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../builders';

import { HandlerFunction, EventHandler } from '../event-handler';

const JOURNAL_EDITOR_REMOVED = 'JournalEditorRemoved';
const JOURNAL_SECTION_EDITOR_REMOVED = 'JournalSectionEditorRemoved';

function removeEditorEventHandlerFactory(eventName: string) {
  return (context: Context): HandlerFunction<JournalEditorRemoved> => {
    return async (data: JournalEditorRemoved) => {
      const usecaseContext = { roles: [Roles.QUEUE_EVENT_HANDLER] };

      const {
        repos: { catalog: catalogRepo, editor: editorRepo },
        services: { logger },
      } = context;

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

        const maybeCurrentEditors = await getEditorsByJournal.execute(
          {
            journalId,
          },
          usecaseContext
        );

        if (maybeCurrentEditors.isLeft()) {
          const err = maybeCurrentEditors.value;
          logger.error(err.message);
          throw err;
        }

        const currentEditors = maybeCurrentEditors.value.map(
          EditorMap.toPersistence
        );

        const maybeEditorsRemoved = await removeEditorsFromJournal.execute(
          {
            journalId,
            allEditors: currentEditors,
          },
          usecaseContext
        );

        const editorsRemovedResponse = maybeEditorsRemoved.value;

        if (maybeEditorsRemoved.isLeft()) {
          logger.error(editorsRemovedResponse.message);
          throw editorsRemovedResponse;
        }

        const maybeAddEditorsToJournal = await assignEditorsToJournal.execute(
          {
            journalId,
            allEditors: eventEditors,
          },
          usecaseContext
        );

        const addEditorsToJournalResponse = maybeAddEditorsToJournal.value;
        if (maybeAddEditorsToJournal.isLeft()) {
          logger.error(maybeAddEditorsToJournal.value.message);
          throw addEditorsToJournalResponse;
        }

        logger.info(`Successfully executed event ${eventName}`);
      } catch (error) {
        logger.error(error.message);
        throw error;
      }
    };
  };
}

export const JournalEditorRemovedHandler: EventHandler<JournalEditorRemoved> = {
  event: JOURNAL_EDITOR_REMOVED,
  handler: removeEditorEventHandlerFactory(JOURNAL_EDITOR_REMOVED),
};

export const JournalSectionEditorRemovedHandler: EventHandler<JournalSectionEditorRemoved> = {
  event: JOURNAL_SECTION_EDITOR_REMOVED,
  handler: removeEditorEventHandlerFactory(JOURNAL_SECTION_EDITOR_REMOVED),
};
