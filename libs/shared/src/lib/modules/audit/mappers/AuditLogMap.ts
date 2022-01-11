import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { Mapper } from '../../../infrastructure/Mapper';
import { AuditLog } from '../domain/AuditLog';

export class AuditLogMap extends Mapper<AuditLog> {
  public static toDomain(raw: any): Either<GuardFailure, AuditLog> {
    return AuditLog.create(
      {
        userAccount: raw.userAccount,
        timestamp: raw.timestamp,
        action: raw.action,
        entity: raw.entity,
        item_reference: raw.item_reference,
        target: raw.target,
      },
      new UniqueEntityID(raw.id)
    );
  }

  public static toPersistence(auditLog: AuditLog): any {
    return {
      id: auditLog.id.toString(),
      userAccount: auditLog.userAccount,
      timestamp: auditLog.timestamp.toISOString,
      action: auditLog.action,
      entity: auditLog.entity,
      item_reference: auditLog.item_reference,
      target: auditLog.target,
    };
  }
}
