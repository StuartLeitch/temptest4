export interface LoggerContract {
  debug(message: any, ...args: any[]): void;
  info(message: any, ...args: any[]): void;
  warn(message: any, ...args: any[]): void;
  error(message: any, ...args: any[]): void;
  setScope(scope: string): void;
}

export interface LoggerBuilderContract {
  setScope(scope: string): void;
}
