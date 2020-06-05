import { LoggerContract } from '../Logger';

export class MockLogger implements LoggerContract {
  constructor(private useConsole = false, private scope = 'TEST_LOGGER') {}

  debug(message: string, ...args: any[]): void {
    if (this.useConsole) {
      console.debug(message);
    }
  }
  info(message: string, ...args: any[]): void {
    if (this.useConsole) {
      console.info(message, args);
    }
  }
  warn(message: string, ...args: any[]): void {
    if (this.useConsole) {
      console.warn(message);
    }
  }
  error(message: string, ...args: any[]): void {
    if (this.useConsole) {
      console.error(message);
    }
  }

  setScope(scope?: string): void {
    this.scope = scope;
  }
}
