import {CommandContract} from './Command';

export interface CommandHandlerContract<T extends CommandContract = any> {
  execute(command: T): Promise<any>;
}
