import { Behavior } from '../../../../../core/logic/strategy';

export abstract class PayBehavior implements Behavior {
  private _type = Symbol.for('@PayBehavior');

  get type(): symbol {
    return this._type;
  }

  abstract pay(): Promise<unknown>;
}
