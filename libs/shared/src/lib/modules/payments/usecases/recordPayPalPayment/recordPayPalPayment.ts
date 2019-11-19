// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Result, left, right, Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { chain } from '../../../../core/logic/EitherChain';
import { UseCase } from '../../../../core/domain/UseCase';
import { map } from '../../../../core/logic/EitherMap';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { InvoiceRepoContract } from '../../../invoices/repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';
import { PayerId } from '../../../payers/domain/PayerId';
import { Amount } from '../../../../domain/Amount';
import { Payment } from '../../domain/Payment';

import { RecordPayPalPaymentResponse } from './recordPayPalPaymentResponse';
import { RecordPayPalPaymentErrors } from './recordPayPalPaymentErrors';
import { RecordPayPalPaymentDTO } from './recordPayPalPaymentDTO';

import { RecordPaymentUsecase } from '../recordPayment/recordPayment';
import { RecordPaymentDTO } from '../recordPayment/recordPaymentDTO';
import { PaymentMethodRepoContract } from '../../repos';
import { GetPaymentMethodByNameUsecase } from '../getPaymentMethodByName/getPaymentMethodByName';

export type RecordPayPalPaymentContext = AuthorizationContext<Roles>;

export class RecordPayPalPaymentUsecase
  implements
    UseCase<
      RecordPayPalPaymentDTO,
      Promise<RecordPayPalPaymentResponse>,
      RecordPayPalPaymentContext
    >,
    AccessControlledUsecase<
      RecordPayPalPaymentDTO,
      RecordPayPalPaymentContext,
      AccessControlContext
    > {
  constructor(
    private paymentMethodRepo: PaymentMethodRepoContract,
    private paymentRepo: PaymentRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {}

  public async execute(
    request: RecordPayPalPaymentDTO,
    context?: RecordPayPalPaymentContext
  ): Promise<RecordPayPalPaymentResponse> {
    const paymentMethodUseCase = new GetPaymentMethodByNameUsecase(
      this.paymentMethodRepo
    );
    const eitherMethod = paymentMethodUseCase.execute({ name: 'PayPal' });

    const payload: Either<any, RecordPaymentDTO> = await this.constructPayload(
      request
    );

    const usecase = new RecordPaymentUsecase(
      this.paymentRepo,
      this.invoiceRepo
    );
    return usecase.execute(payload.value);
  }

  private async constructPayload(request: RecordPayPalPaymentDTO) {
    const payloadEither = chain(
      [
        this.getPayloadWithPaymentMethodId,
        this.getPayloadWithAmount.bind(null, request)
      ],
      this.getEmptyPayload()
    );

    return payloadEither;
  }

  private getEmptyPayload() {
    return right({
      paymentMethodId: null,
      invoiceId: null,
      payerId: null,
      amount: null
    });
  }

  private async getPayloadWithPaymentMethodId(payload: RecordPaymentDTO) {
    const usecase = new GetPaymentMethodByNameUsecase(this.paymentMethodRepo);
    const either = await usecase.execute({ name: 'PayPal' });
    return either.map(paymentMethodResult => ({
      ...payload,
      paymentMethodId: paymentMethodResult.getValue().id
    }));
  }

  private async getPayloadWithAmount(
    request: RecordPayPalPaymentDTO,
    payload: RecordPaymentDTO
  ) {
    return right({
      ...payload,
      amount: parseInt(request.resource.amount.value, 10)
    });
  }
}
