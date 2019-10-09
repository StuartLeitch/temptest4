import 'reflect-metadata';

import {CommandContract} from './commands/contracts/Command';
import {CommandHandlerContract} from './commands/contracts/CommandHandler';
import {CommandBusContract} from './commands/contracts/CommandBus';

// import {COMMAND_HANDLER_METADATA} from '../common/decorators/constants';

export class CommandBus implements CommandBusContract {
  private handlers = new Map<string, CommandHandlerContract<CommandContract>>();

  public async execute<T extends CommandContract>(command: T): Promise<any> {
    const handler = this.handlers.get(this.getCommandName(command));
    if (!handler) {
      // throw new CommandHandlerNotFoundException();
    }
    return handler.execute(command);
  }

  private getCommandName(command: CommandContract): string {
    const {constructor} = Object.getPrototypeOf(command);
    return constructor.name as string;
  }

  // private reflectCommandName(
  //   handler: CommandHandlerContract
  // ): FunctionConstructor {
  //   return Reflect.getMetadata(COMMAND_HANDLER_METADATA, handler);
  // }
}
