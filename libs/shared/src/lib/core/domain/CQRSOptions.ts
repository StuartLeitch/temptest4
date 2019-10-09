import {CommandHandlerContract} from './commands/contracts/CommandHandler';
import {EventBusContract} from './events/contracts/EventBus';
import {QueryHandlerContract} from './queries/contracts/QueryHandler';

export interface CQRSOptions {
  events?: EventBusContract[];
  queries?: QueryHandlerContract[];
  commands?: CommandHandlerContract[];
}
