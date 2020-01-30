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
import { BraintreeGateway } from '../../../payments/infrastructure/gateways/braintree/gateway';
import {
  InvoiceRepoContract,
  InvoiceItemRepoContract
} from '../../../invoices/repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';

import { RecordCreditCardPaymentResponse } from './recordCreditCardPaymentResponse';
import { RecordCreditCardPaymentErrors } from './recordCreditCardPaymentErrors';
import { RecordCreditCardPaymentDTO } from './recordCreditCardPaymentDTO';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetManuscriptByInvoiceIdUsecase } from '../../../manuscripts/usecases/getManuscriptByInvoiceId';

import { Braintree } from './../../domain/strategies/Braintree';
import { BraintreePayment } from '../../domain/strategies/BraintreePayment';
import { PaymentFactory } from './../../domain/strategies/PaymentFactory';
import { PaymentModel } from './../../domain/contracts/PaymentModel';
import { PaymentStrategy } from './../../domain/strategies/PaymentStrategy';
import { RecordPaymentUsecase } from '../recordPayment';
import { ArticleRepoContract } from '../../../manuscripts/repos';

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
    private invoiceRepo: InvoiceRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract
  ) {}

  public async execute(
    request: RecordCreditCardPaymentDTO,
    context?: RecordCreditCardPaymentContext
  ): Promise<RecordCreditCardPaymentResponse> {
    const getInvoiceDetailsUsecase = new GetInvoiceDetailsUsecase(
      this.invoiceRepo
    );
    const invoiceDetailsResult = await getInvoiceDetailsUsecase.execute(
      {
        invoiceId: request.invoiceId
      },
      {
        roles: [Roles.PAYER]
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
      invoiceId: request.invoiceId
    });
    if (maybeManuscripts.isLeft()) {
      return maybeManuscripts as any;
    }
    const manuscripts = maybeManuscripts.value.getValue();

    const braintree = new Braintree();
    braintree.paymentMethodNonce = request.paymentMethodNonce;
    braintree.invoiceReferenceNumber = invoiceDetails.referenceNumber;
    braintree.manuscriptCustomId = manuscripts.reduce(
      (acc, manuscript) => `${acc} ${manuscript.customId}`,
      ''
    );
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
