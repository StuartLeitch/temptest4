export interface AuditLoggerServiceContract {
  setUserData(any): void;
  log(message: unknown, ...args: unknown[]): void;
}
