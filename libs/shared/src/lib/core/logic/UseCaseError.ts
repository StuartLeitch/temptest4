import { UseCaseErrorErrorContract } from './contracts/UseCaseErrorContract';

export abstract class UseCaseError implements UseCaseErrorErrorContract {
  constructor(
    public readonly message: string,
    public readonly name: string = ''
  ) {
    this.message = message;
  }
}
