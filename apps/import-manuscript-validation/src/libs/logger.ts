import { Logger as BaseLogger } from '@hindawi/shared';

export class Logger extends BaseLogger {
  private _messages: Array<string> = [];

  get messages(): string {
    return this._messages.join('\n');
  }

  protected log(level: string, message: string, args: any[]): void {
    this._messages.push(message);
    super.log(level, message, args);
  }
}
