import { Behavior } from '../../../../core/logic/strategy';
import { Strategy } from '../../../../core/logic/strategy';

import { ExternalOrderId } from '../../../../domain/external-order-id';

import { PaymentMethodId } from '../PaymentMethodId';

import { PayBehavior, PaymentDTO } from './behaviors';

interface PaymentDetails {
  foreignPaymentId: ExternalOrderId;
  paymentMethodId: PaymentMethodId;
}

export class PaymentStrategy implements Strategy {
  private _type = Symbol.for('@PaymentStrategy');
  private behaviors: Behavior[] = [];

  get type(): symbol {
    return this._type;
  }

  get behaviorTypes(): symbol[] {
    return this.behaviors.map((b) => b.type);
  }

  constructor(
    private paymentMethod: PaymentMethodId,
    private payBehavior: PayBehavior
  ) {
    this.behaviors.push(payBehavior);
  }

  async makePayment(request: PaymentDTO): Promise<PaymentDetails> {
    const foreignPaymentId = await this.payBehavior.makePayment(request);

    return {
      paymentMethodId: this.paymentMethod,
      foreignPaymentId,
    };
  }
}
