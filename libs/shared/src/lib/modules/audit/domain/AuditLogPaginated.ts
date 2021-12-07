import { AuditLog } from './AuditLog';

export interface AuditLogPaginated {
  auditLogs: Array<AuditLog>;
  totalCount: string;
}
