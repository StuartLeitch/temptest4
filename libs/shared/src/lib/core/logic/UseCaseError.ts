import {UseCaseErrorErrorContract} from './contracts/UseCaseErrorError';

export abstract class UseCaseError implements UseCaseErrorErrorContract {
  constructor(public readonly message: string) {
    this.message = message;
  }
}
