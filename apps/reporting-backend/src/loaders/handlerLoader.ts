import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { ReportingContext } from './contextLoader';
import { Logger } from '../lib/logger';

const logger = new Logger('handler:saveEventsHandler');

export const handlerLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: ReportingContext = settings.getData('context');
    const { filterEventsService } = context.services;
    const { saveEventsUsecase } = context.usecases;

    const saveEventsHandler = async (events: AWS.SQS.Message[]) => {
      const start = new Date();
      try {
        const filteredEvents = await filterEventsService.filterEvents(events);

        await saveEventsUsecase.execute({
          events: filteredEvents
        });
        logger.info(
          `Saving ${filteredEvents.length} events took ${(new Date().getTime() -
            start.getTime()) /
            1000} seconds.`
        );
      } catch (error) {
        logger.error(error);
      }
    };

    const handlers: ReportingHandlers = { saveEventsHandler };
    settings.setData('handlers', handlers);
  }
};

export interface ReportingHandlers {
  saveEventsHandler: (events: AWS.SQS.Message[]) => Promise<unknown>;
}
