import { BraintreeGateway } from '@hindawi/shared';
// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

// * Usecase specific
import { InvoiceRepoContract } from '../../../invoices/repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';

import { RecordCreditCardPaymentResponse } from './recordCreditCardPaymentResponse';
import { RecordCreditCardPaymentErrors } from './recordCreditCardPaymentErrors';
import { RecordCreditCardPaymentDTO } from './recordCreditCardPaymentDTO';

import { Braintree } from './../../domain/strategies/Braintree';
import { BraintreePayment } from './../../domain/strategies/BraintreePayment';
import { PaymentFactory } from './../../domain/strategies/PaymentFactory';
import { PaymentModel } from './../../domain/contracts/PaymentModel';
import { PaymentStrategy } from './../../domain/strategies/PaymentStrategy';
import { RecordPaymentUsecase } from '../recordPayment';

export type RecordCreditCardPaymentContext = AuthorizationContext<Roles>;

export class RecordCreditCardPaymentUsecase
  implements
    UseCase<
      RecordCreditCardPaymentDTO,
      Promise<RecordCreditCardPaymentResponse>,
      RecordCreditCardPaymentContext
    >,
    AccessControlledUsecase<
      RecordCreditCardPaymentDTO,
      RecordCreditCardPaymentContext,
      AccessControlContext
    > {
  constructor(
    private paymentRepo: PaymentRepoContract,
    private invoiceRepo: InvoiceRepoContract
  ) {}

  public async execute(
    request: RecordCreditCardPaymentDTO,
    context?: RecordCreditCardPaymentContext
  ): Promise<RecordCreditCardPaymentResponse> {
    const braintree = new Braintree();
    braintree.paymentMethodNonce = request.paymentMethodNonce;
    const paymentFactory = new PaymentFactory();
    paymentFactory.registerPayment(braintree);
    const paymentStrategy: PaymentStrategy = new PaymentStrategy([
      ['Braintree', new BraintreePayment(BraintreeGateway)]
    ]);
    const paymentModel: PaymentModel = paymentFactory.create(
      'BraintreePayment'
    );

    const payment: any = await paymentStrategy.makePayment(
      paymentModel,
      request.amount
    );

    if (!payment.success) {
      return left(
        new RecordCreditCardPaymentErrors.PaymentError(payment.message)
      );
    }

    console.log('BT Transaction ID: ' + payment.transaction.id);
    const payload = { ...request, foreignPaymentId: payment.transaction.id };

    const usecase = new RecordPaymentUsecase(
      this.paymentRepo,
      this.invoiceRepo
    );

    return await usecase.execute(payload);
  }
}
