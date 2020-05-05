import { LoggerContract } from './Logger';

export class MockLogger implements LoggerContract {
  constructor(private useConsole = false) {}

  debug(message: string, ...args: any[]): void {
    if (this.useConsole) {
      console.debug(message);
    }
  }
  info(message: string, ...args: any[]): void {
    if (this.useConsole) {
      console.info(message);
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
}
