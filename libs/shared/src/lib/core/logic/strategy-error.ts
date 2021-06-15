import { StrategyErrorContract } from './contracts/strategy-error';

export abstract class StrategyError implements StrategyErrorContract {
  constructor(
    public readonly message: string,
    public readonly behavior: string
  ) {}

  toString(): string {
    return `Error of type: "${this.constructor.name}" with message this.message occurred in behavior "${this.behavior}"`;
  }
}

export class UnexpectedStrategyError extends StrategyError {
  constructor(err: Error, behavior: string) {
    super(`Unexpected strategy error: ${err.message}`, behavior);
  }
}
