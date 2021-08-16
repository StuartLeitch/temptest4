/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { AuditLog } from "../../../modules/audit/domain/AuditLog";

/**
 * ------------------------------------------------
 * This is the main AuditLogger Object.
 * ------------------------------------------------
 */
export class AuditLoggerService {
  private userData: any;

  constructor(private auditLogRepo) {
    // * do nothing yet
  }

  setUserData(userData: any) {
    this.userData = userData;
  }

  public log(args: any): void {
    const log = AuditLog.create({
      userAccount: this.userData.email,
      ...args
    }).value;

    this.auditLogRepo.save(log);
  }
}
