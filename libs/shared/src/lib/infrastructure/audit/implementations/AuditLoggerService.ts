/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

/**
 * ------------------------------------------------
 * This is the main AuditLogger Object.
 * ------------------------------------------------
 */
export class AuditLoggerService {
  constructor(private auditLogRepo) {}

  public log(args: any[]): void {
    const o = {};
    this.auditLogRepo.save(o);
  }
}
