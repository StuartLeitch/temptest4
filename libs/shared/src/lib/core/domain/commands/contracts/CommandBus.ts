import {CommandContract} from './Command';

export interface CommandBusContract {
  execute<T extends CommandContract>(command: T): Promise<any>;
}
