import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';
import { ReportingContext } from './contextLoader';

export const handlerLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: ReportingContext = settings.getData('context');
    const { saveSqsEventsUsecase } = context.usecases;

    const saveEventsHandler = async (events: AWS.SQS.Message[]) => {
      await saveSqsEventsUsecase.execute(events);
    };

    const handlers: ReportingHandlers = { saveEventsHandler };
    settings.setData('handlers', handlers);
  }
};

export interface ReportingHandlers {
  saveEventsHandler: (events: AWS.SQS.Message[]) => Promise<unknown>;
}
