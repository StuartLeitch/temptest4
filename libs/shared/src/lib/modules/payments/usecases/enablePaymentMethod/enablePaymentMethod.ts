// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {PaymentMethod} from '../../domain/PaymentMethod';
import {PaymentMethodId} from '../../domain/PaymentMethodId';
import {PaymentMethodRepoContract} from '../../repos/paymentMethodRepo';

import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {Roles} from '../../../users/domain/enums/Roles';

export interface EnablePaymentRequestDTO {
  paymentMethodId?: string;
  toggle: boolean;
}

export type EnablePaymentMethodContext = AuthorizationContext<Roles>;

export class EnablePaymentMethodUsecase
  implements
    UseCase<
      EnablePaymentRequestDTO,
      Result<PaymentMethod>,
      EnablePaymentMethodContext
    >,
    AccessControlledUsecase<
      EnablePaymentRequestDTO,
      EnablePaymentMethodContext,
      AccessControlContext
    > {
  constructor(private paymentMethodRepo: PaymentMethodRepoContract) {
    this.paymentMethodRepo = paymentMethodRepo;
  }

  private async getPaymentMethod(
    request: EnablePaymentRequestDTO
  ): Promise<Result<PaymentMethod>> {
    const {paymentMethodId} = request;

    if (!paymentMethodId) {
      return Result.fail<PaymentMethod>(
        `Invalid payment method id=${paymentMethodId}`
      );
    }

    const paymentMethod = await this.paymentMethodRepo.getPaymentMethodById(
      PaymentMethodId.create(new UniqueEntityID(paymentMethodId))
    );
    const found = !!paymentMethod;

    if (found) {
      return Result.ok<PaymentMethod>(paymentMethod);
    } else {
      return Result.fail<PaymentMethod>(
        `Couldn't find paymentMethod by id=${paymentMethodId}`
      );
    }
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('paymentMethod:enable')
  public async execute(
    request: EnablePaymentRequestDTO,
    context?: EnablePaymentMethodContext
  ): Promise<Result<PaymentMethod>> {
    try {
      const {toggle} = request;

      // * System looks-up the payment method
      const paymentMethodOrError = await this.getPaymentMethod(request);

      if (paymentMethodOrError.isFailure) {
        return Result.fail<PaymentMethod>(paymentMethodOrError.error);
      }

      const paymentMethod = paymentMethodOrError.getValue();
      paymentMethod.isActive = toggle;

      // * This is where all the magic happens
      return Result.ok<PaymentMethod>(paymentMethod);
    } catch (err) {
      console.log(err);
      return Result.fail<PaymentMethod>(err);
    }
  }
}
