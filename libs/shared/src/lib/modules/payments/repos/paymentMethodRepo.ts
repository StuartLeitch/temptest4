import { GuardFailure } from '../../../core/logic/GuardFailure'
import { Either } from '../../../core/logic/Either'

import { RepoError } from '../../../infrastructure/RepoError'
import { Repo } from '../../../infrastructure/Repo';

import { PaymentMethodId } from '../domain/PaymentMethodId';
import { PaymentMethod } from '../domain/PaymentMethod';

export interface PaymentMethodRepoContract extends Repo<PaymentMethod> {
  getPaymentMethodById(paymentMethodId: PaymentMethodId): Promise<Either<GuardFailure | RepoError,PaymentMethod>>;
  getPaymentMethodByName(paymentMethodName: string): Promise<Either<GuardFailure | RepoError,PaymentMethod>>;
  getPaymentMethodCollection(): Promise<Either<GuardFailure | RepoError,PaymentMethod[]>>;
  getPaymentMethods(): Promise<Either<GuardFailure | RepoError,PaymentMethod[]>>;
}
