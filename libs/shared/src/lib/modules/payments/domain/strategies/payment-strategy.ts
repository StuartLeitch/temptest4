import { StrategyError } from '../../../../core/logic/strategy-error';
import { Behavior, Strategy } from '../../../../core/logic/strategy';
import { Either } from '../../../../core/logic/Either';

import { PaymentClientToken } from '../../../../domain/PaymentClientToken';

import { ExternalOrderId } from '../external-order-id';
import { PaymentMethodId } from '../PaymentMethodId';
import { PaymentProof } from '../payment-proof';
import { PaymentStatus } from '../Payment';

import {
  CreateClientTokenBehavior,
  CaptureMoneyBehavior,
  CaptureMoneyDTO,
  PaymentBehavior,
  PaymentDTO,
} from './behaviors';

export interface PaymentDetails {
  foreignPaymentId: ExternalOrderId;
  paymentMethodId: PaymentMethodId;
  status: PaymentStatus;
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
    private clientTokenBehavior: CreateClientTokenBehavior,
    private captureBehavior: CaptureMoneyBehavior,
    private payBehavior: PaymentBehavior,
    private paymentMethod: PaymentMethodId
  ) {
    this.behaviors.push(payBehavior);
  }

  async makePayment(
    request: PaymentDTO
  ): Promise<Either<StrategyError, PaymentDetails>> {
    const maybePayment = await this.payBehavior.makePayment(request);

    return maybePayment.map(({ foreignPaymentId, status }) => ({
      paymentMethodId: this.paymentMethod,
      foreignPaymentId,
      status,
    }));
  }

  async captureMoney(
    request: CaptureMoneyDTO
  ): Promise<Either<StrategyError, PaymentProof>> {
    return this.captureBehavior.captureMoney(request);
  }

  async createClientToken(): Promise<
    Either<StrategyError, PaymentClientToken>
  > {
    return this.clientTokenBehavior.createClientToken();
  }
}
