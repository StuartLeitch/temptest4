export interface LoggerContract {
  debug(message: unknown, ...args: unknown[]): void;
  info(message: unknown, ...args: unknown[]): void;
  warn(message: unknown, ...args: unknown[]): void;
  error(message: unknown, ...args: unknown[]): void;
  setScope(scope: string): void;
}

export interface LoggerBuilderContract {
  setScope(scope: string): void;
  getLogger(): LoggerContract;
}

export interface LoggerOptions {
  logLevel?: string;
  isDevelopment?: boolean;
}
