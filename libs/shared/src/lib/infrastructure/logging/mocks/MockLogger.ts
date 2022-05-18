import { LoggerContract, LoggerBuilderContract } from '../LoggerContract';

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
}

export class MockLoggerBuilder implements LoggerBuilderContract {
  getLogger(scope: string): MockLogger;
  getLogger(): MockLogger;
  getLogger(scope = 'TEST_LOGGER'): MockLogger {
    return new MockLogger(false, scope);
  }
}
