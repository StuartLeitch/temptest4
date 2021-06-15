import { GuardFailureContract } from './contracts/GuardFailureContract';

export class GuardFailure implements GuardFailureContract {
  constructor(public readonly message: string) {}
}
