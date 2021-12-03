
export interface AuditLogType {
  id: string;
  userAccount: string;
  action: string;
  entity: string;
  timestamp: Date;
  item_reference: string;
  target: string;
}
