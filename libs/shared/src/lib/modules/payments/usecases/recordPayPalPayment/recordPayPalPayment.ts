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

const checkoutNodeJsSDK = require('@paypal/checkout-server-sdk');

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
    private invoiceRepo: InvoiceRepoContract,
    private payPalService: any
  ) {}

  public async execute(
    request: RecordPayPalPaymentDTO,
    context?: RecordPayPalPaymentContext
  ): Promise<RecordPayPalPaymentResponse> {
    const payloadEither: Either<
      any,
      RecordPaymentDTO
    > = await this.constructPayload(request);
    const usecase = new RecordPaymentUsecase(
      this.paymentRepo,
      this.invoiceRepo
    );

    const a: any = await chain(
      [payload => usecase.execute(payload)],
      payloadEither
    );
    return a as RecordPayPalPaymentResponse;
  }

  private async constructPayload(request: RecordPayPalPaymentDTO) {
    const partialPayloadEither = await chain(
      [
        this.getPayloadWithPaymentMethodId.bind(this),
        this.getPayloadWithAmountAndDate.bind(this, request.orderId)
      ],
      this.getEmptyPayload()
    );

    const payloadEither = map(
      [
        this.getPayloadWithPayPalForeignPaymentId.bind(this, request.orderId),
        this.getPayloadWithInvoiceID.bind(this, request.invoiceId),
        this.getPayloadWithPayerId.bind(this, request.payerId)
      ],
      partialPayloadEither
    );

    return payloadEither;
  }

  private getEmptyPayload() {
    return {
      foreignPaymentId: null,
      paymentMethodId: null,
      invoiceId: null,
      datePaid: null,
      payerId: null,
      amount: null
    };
  }

  private async getPayloadWithPaymentMethodId(payload: RecordPaymentDTO) {
    const usecase = new GetPaymentMethodByNameUsecase(this.paymentMethodRepo);
    const either = await usecase.execute({ name: 'PayPal' });
    return either.map(async paymentMethodResult => ({
      ...payload,
      paymentMethodId: paymentMethodResult.getValue().id.toString()
    }));
  }

  private async getPayPalOrderDetails(orderId: string) {
    try {
      const request = new checkoutNodeJsSDK.orders.OrdersCaptureRequest(
        orderId
      );
      const order = await this.payPalService().execute(request);
      return right(order.result);
    } catch (e) {
      console.log(e);
      return left(new RecordPayPalPaymentErrors.PaymentNotFond(orderId));
    }
  }

  private calculateTotalPaid(payPalTransactionDetails) {
    const paymentCaptures =
      payPalTransactionDetails.purchase_units[0].payments.captures;
    const totalPaid = paymentCaptures.reduce(
      (acc: number, capture) => acc + parseFloat(capture.amount.value),
      0
    );
    return totalPaid;
  }

  private getDateOfPayment(payPalTransactionDetails) {
    return payPalTransactionDetails.purchase_units[0].payments.captures[0]
      .create_time;
  }

  private async getPayloadWithAmountAndDate(
    payPalOrderId: string,
    payload: RecordPaymentDTO
  ) {
    const allDetailsEither = await this.getPayPalOrderDetails(payPalOrderId);
    const payPalDetails = allDetailsEither.map(details => {
      const totalPaid = this.calculateTotalPaid(details);
      const datePaid = this.getDateOfPayment(details);
      return { totalPayed: totalPaid, datePaid };
    });
    return payPalDetails.map(({ totalPayed, datePaid }) => ({
      ...payload,
      amount: totalPayed,
      datePaid
    }));
  }

  private async getPayloadWithPayPalForeignPaymentId(
    orderId: string,
    payload: RecordPaymentDTO
  ) {
    return { ...payload, foreignPaymentId: orderId };
  }

  private async getPayloadWithPayerId(
    payerId: string,
    payload: RecordPaymentDTO
  ) {
    return { ...payload, payerId };
  }

  private async getPayloadWithInvoiceID(
    invoiceId: string,
    payload: RecordPaymentDTO
  ) {
    return { ...payload, invoiceId };
  }
}
