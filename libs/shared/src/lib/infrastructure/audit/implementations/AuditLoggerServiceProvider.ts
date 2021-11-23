// import { AuditLogRepoContract } from '../../../modules/audit/repos/auditLogRepo';
import { AuditLoggerService } from './AuditLoggerService';

export class AuditLoggerServiceProvider {
  static provide(auditRepo: any) {
    return function(userData) {
      return new AuditLoggerService(auditRepo, userData);
    }
  }
}
