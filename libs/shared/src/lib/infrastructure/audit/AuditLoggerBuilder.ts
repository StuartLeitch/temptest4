import { AuditLogger } from './implementations/AuditLogger';
import { LoggerBuilderContract, LoggerContract } from './AuditLogger';

/**
 * The Concrete Builder classes follow the Builder interface and provide
 * specific implementations of the building steps. Your program may have several
 * variations of Builders, implemented differently.
 */
export class LoggerBuilder implements LoggerBuilderContract {
  private logger: LoggerContract;

  /**
   * A fresh builder instance should contain a blank product object, which is
   * used in further assembly.
   */
  constructor(private scope?: string, private options?: LoggerOptions) {
    this.reset();
  }

  public reset(): void {
    this.logger = new Logger(this.scope, this.options);
  }

  public setScope(scope: string): void {
    this.logger.setScope(scope);
  }

  public getLogger(): LoggerContract {
    const result = this.logger;
    this.reset();
    return result;
  }
}
