/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { AuditLog } from "../../../modules/audit/domain/AuditLog";
import { AuditLoggerServiceContract } from "../AuditLoggerService";

/**
 * ------------------------------------------------
 * This is the main AuditLogger Service class.
 * ------------------------------------------------
 */
export class AuditLoggerService implements AuditLoggerServiceContract {

  constructor(
    private readonly auditLogRepo,
    private readonly userData: any
  ) {}

  public log(args: any): void {
    const log = AuditLog.create({
      userAccount: this.userData.email,
      ...args
    }).value;

    this.auditLogRepo.save(log);
  }
}
