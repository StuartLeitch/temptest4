export interface LoggerContract {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  setScope(scope: string): void;
}

export interface LoggerBuilderContract {
  setScope(scope: string): void;
}
