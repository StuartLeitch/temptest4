
export interface AuditLogType {
  id: string;
  userAccount: string;
  action: string;
  entity: string;
  timestamp: Date;
  oldValue: string;
  currentValue: string;
}
