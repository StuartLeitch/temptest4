// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { left } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  Roles,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import {
  InvoiceRepoContract,
  InvoiceItemRepoContract,
} from '../../../invoices/repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';

import { RecordCreditCardPaymentResponse } from './recordCreditCardPaymentResponse';
import { RecordCreditCardPaymentErrors } from './recordCreditCardPaymentErrors';
import { RecordCreditCardPaymentDTO } from './recordCreditCardPaymentDTO';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';

import { Braintree } from './../../domain/strategies/Braintree';
import { BraintreePayment } from '../../domain/strategies/BrainTreePayment';
import { PaymentFactory } from './../../domain/strategies/PaymentFactory';
import { PaymentModel } from './../../domain/contracts/PaymentModel';
import { PaymentStrategy } from './../../domain/strategies/PaymentStrategy';
import { RecordPaymentUsecase } from '../recordPayment';
import { ArticleRepoContract } from '../../../manuscripts/repos';

export class RecordCreditCardPaymentUsecase
  implements
    UseCase<
      RecordCreditCardPaymentDTO,
      Promise<RecordCreditCardPaymentResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      RecordCreditCardPaymentDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private paymentRepo: PaymentRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private paymentGateway: any
  ) {}

  public async execute(
    request: RecordCreditCardPaymentDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<RecordCreditCardPaymentResponse> {
    const getInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(
      this.invoiceRepo
    );
    const invoiceDetailsResult = await getInvoiceDetailsUsecase.execute(
      {
        invoiceId: request.invoiceId,
      },
      {
        roles: [Roles.PAYER],
      }
    );
    if (invoiceDetailsResult.isLeft()) {
      return left(
        new RecordCreditCardPaymentErrors.PaymentError(
          `Invalid invoice id {${request.invoiceId}}`
        )
      );
    }
    const invoiceDetails = invoiceDetailsResult.value.getValue();

    const getManuscriptsByInvoiceIdUsecase = new GetManuscriptByInvoiceIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );
    const maybeManuscripts = await getManuscriptsByInvoiceIdUsecase.execute({
      invoiceId: request.invoiceId,
    });
    if (maybeManuscripts.isLeft()) {
      return maybeManuscripts as any;
    }
    const manuscripts = maybeManuscripts.value.getValue();

    const braintree = new Braintree();
    braintree.paymentMethodNonce = request.paymentMethodNonce;
    braintree.invoiceReferenceNumber = invoiceDetails.referenceNumber;
    braintree.merchantAccountId = request.merchantAccountId;
    braintree.manuscriptCustomId = manuscripts.reduce(
      (acc, manuscript) => `${acc} ${manuscript.customId}`,
      ''
    );
    const paymentFactory = new PaymentFactory();
    paymentFactory.registerPayment(braintree);
    const paymentStrategy: PaymentStrategy = new PaymentStrategy([
      ['Braintree', new BraintreePayment(this.paymentGateway)],
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
    const payload = {
      ...request,
      foreignPaymentId: payment.transaction.id,
      markInvoiceAsPaid: true,
    };

    const usecase = new RecordPaymentUsecase(
      this.paymentRepo,
      this.invoiceRepo
    );

    return await usecase.execute(payload);
  }
}
