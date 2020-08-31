import { ServiceErrorContract } from './contracts/service-error';

export abstract class ServiceError implements ServiceErrorContract {
  readonly originatingService: string;
  readonly rawError?: Error;
  readonly message: string;

  constructor(message: string, serviceName: string, err?: Error) {
    this.originatingService = serviceName;
    this.message = message;
    this.rawError = err;
  }

  toString(): string {
    const rawErrorString = this.rawError
      ? `, original error: ${this.rawError}`
      : '';
    return `Error of type: "${this.constructor.name}" with message: ${this.message},
    ocurred in service: "${this.originatingService}"${rawErrorString}`;
  }
}
