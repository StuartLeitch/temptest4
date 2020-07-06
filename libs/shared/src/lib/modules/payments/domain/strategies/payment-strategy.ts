import { Behavior } from '../../../../core/logic/strategy';
import { Strategy } from '../../../../core/logic/strategy';

import { PayBehavior } from './behaviors';

export class PaymentStrategy implements Strategy {
  private _type = Symbol.for('@PaymentStrategy');
  private behaviors: Behavior[] = [];

  get type(): symbol {
    return this._type;
  }

  get behaviorTypes(): symbol[] {
    return this.behaviors.map((b) => b.type);
  }

  constructor(private payBehavior: PayBehavior) {
    this.behaviors.push(payBehavior);
  }

  pay(): Promise<unknown> {
    return this.payBehavior.pay();
  }
}
