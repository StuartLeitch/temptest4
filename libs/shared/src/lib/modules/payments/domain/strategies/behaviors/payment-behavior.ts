import { StrategyError } from '../../../../../core/logic/strategy-error';
import { Behavior } from '../../../../../core/logic/strategy';
import { Either } from '../../../../../core/logic/Either';

import { ExternalOrderId } from '../../../domain/external-order-id';
import { PaymentStatus } from '../../../domain/Payment';

export interface PaymentDTO {
  invoiceReferenceNumber: string;
  payerIdentification: string;
  manuscriptCustomId: string;
  paymentReference: string;
  discountAmount: number;
  invoiceTotal: number;
  invoiceId: string;
  netAmount: number;
  vatAmount: number;
}

export interface PaymentResponse {
  foreignPaymentId: ExternalOrderId;
  status: PaymentStatus;
}

export abstract class PaymentBehavior implements Behavior {
  readonly type = Symbol.for('@PaymentBehavior');

  abstract makePayment(
    request: PaymentDTO
  ): Promise<Either<StrategyError, PaymentResponse>>;
}
