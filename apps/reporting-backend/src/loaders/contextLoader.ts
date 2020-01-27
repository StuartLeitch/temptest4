import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';
import { KnexEventsRepo } from '../../../../libs/shared/src/lib/modules/reporting/repos/implementation/KnexEventsRepo';
export const contextLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const db = settings.getData('connection');

    const repos = {
      eventsRepo: new KnexEventsRepo(db)
    };

    const services = {};

    const context = {
      repos,
      services
    };

    settings.setData('context', context);
  }
};
