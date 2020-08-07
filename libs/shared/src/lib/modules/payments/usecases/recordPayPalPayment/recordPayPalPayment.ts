/* eslint-disable @typescript-eslint/no-var-requires */

// * Core Domain
import { left, right, Either } from '../../../../core/logic/Result';
import { chain } from '../../../../core/logic/EitherChain';
import { UseCase } from '../../../../core/domain/UseCase';
import { map } from '../../../../core/logic/EitherMap';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
import { InvoiceRepoContract } from '../../../invoices/repos';
import { PaymentRepoContract } from '../../repos/paymentRepo';

import { RecordPayPalPaymentResponse } from './recordPayPalPaymentResponse';
import { RecordPayPalPaymentErrors } from './recordPayPalPaymentErrors';
import { RecordPayPalPaymentDTO } from './recordPayPalPaymentDTO';

import { RecordPaymentUsecase } from '../recordPayment/recordPayment';
import { RecordPaymentDTO } from '../recordPayment/recordPaymentDTO';

const checkoutNodeJsSDK = require('@paypal/checkout-server-sdk');

export class RecordPayPalPaymentUsecase
  implements
    UseCase<
      RecordPayPalPaymentDTO,
      Promise<RecordPayPalPaymentResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      RecordPayPalPaymentDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private paymentRepo: PaymentRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private payPalService: any
  ) {}

  public async execute(
    request: RecordPayPalPaymentDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<RecordPayPalPaymentResponse> {
    const payloadEither: Either<
      any,
      RecordPaymentDTO
    > = await this.constructPayload(request);
    const usecase = new RecordPaymentUsecase(
      this.paymentRepo,
      this.invoiceRepo
    );

    const paymentEither: any = await chain(
      [(payload) => usecase.execute(payload)],
      payloadEither
    );
    return paymentEither as RecordPayPalPaymentResponse;
  }

  private async constructPayload(request: RecordPayPalPaymentDTO) {
    const partialPayloadEither = await chain(
      [this.getPayloadWithAmountAndDate.bind(this, request.orderId)],
      this.getEmptyPayload(request.paymentMethodId)
    );

    const payloadEither = map(
      [
        this.getPayloadWithPayPalForeignPaymentId.bind(this, request.orderId),
        this.getPayloadWithInvoiceID.bind(this, request.invoiceId),
        this.getPayloadWithPayerId.bind(this, request.payerId),
      ],
      partialPayloadEither
    );

    return payloadEither;
  }

  private getEmptyPayload(paymentMethodId: string) {
    return {
      foreignPaymentId: null,
      paymentMethodId,
      invoiceId: null,
      datePaid: null,
      payerId: null,
      amount: null,
    };
  }

  private async getPayPalOrderDetails(orderId: string) {
    try {
      const request = new checkoutNodeJsSDK.orders.OrdersGetRequest(orderId);
      const order = await this.payPalService.execute(request);
      console.log(`PayPal Order ID: ${orderId}`);
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
    const payPalDetails = allDetailsEither.map((details) => {
      const totalPaid = this.calculateTotalPaid(details);
      const datePaid = this.getDateOfPayment(details);
      return { totalPayed: totalPaid, datePaid };
    });
    return payPalDetails.map(({ totalPayed, datePaid }) => ({
      ...payload,
      amount: totalPayed,
      datePaid,
    }));
  }

  private async getPayloadWithPayPalForeignPaymentId(
    orderId: string,
    payload: RecordPaymentDTO
  ) {
    return { ...payload, foreignPaymentId: orderId, markInvoiceAsPaid: true };
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
