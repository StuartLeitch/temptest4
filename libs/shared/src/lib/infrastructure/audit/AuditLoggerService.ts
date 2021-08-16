export interface AuditLoggerServiceContract {
  log(message: unknown, ...args: unknown[]): void;
}
