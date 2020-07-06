import { Behavior } from '../../../../../core/logic/strategy';

import { ExternalOrderId } from '../../../../../domain/external-order-id';

export interface PaymentDTO {
  invoiceReferenceNumber: string;
  payerIdentification: string;
  manuscriptCustomId: string;
  invoiceTotal: number;
}

export abstract class PayBehavior implements Behavior {
  readonly type = Symbol.for('@PayBehavior');

  abstract makePayment(request: PaymentDTO): Promise<ExternalOrderId>;
}
