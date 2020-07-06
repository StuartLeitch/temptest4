import { StrategyFactory } from '../../../../core/logic/strategy/strategy-factory';

import { PaymentMethodNames } from '../PaymentMethod';
import { PaymentMethodId } from '../PaymentMethodId';

import { PaymentMethodRepoContract } from '../../repos';

import { PaymentStrategy } from './payment-strategy';
import {
  BraintreePayBehavior,
  PayPalPayBehavior,
} from './behaviors/implementations';

enum StrategySelection {
  BankTransfer = '@BankTransfer',
  Braintree = '@Braintree',
  Migration = '@Migration',
  PayPal = '@PayPal',
}

interface SelectionData {
  payerIdentification: string;
  paymentReference: string;
}

type Builders = { [key in StrategySelection]: () => Promise<PaymentStrategy> };

class PaymentStrategyFactory
  implements
    StrategyFactory<PaymentStrategy, StrategySelection, SelectionData> {
  constructor(
    private braintreePay: BraintreePayBehavior,
    private paypalPay: PayPalPayBehavior,
    private paymentMethodRepo: PaymentMethodRepoContract
  ) {}

  async getStrategy(type: StrategySelection): Promise<PaymentStrategy> {
    return this.builders[type]();
  }

  async selectStrategy(data: SelectionData): Promise<PaymentStrategy> {
    const { payerIdentification, paymentReference } = data;

    if (!payerIdentification && !paymentReference) {
      return this.builders[StrategySelection.PayPal]();
    }

    if (!payerIdentification && paymentReference) {
      return this.builders[StrategySelection.BankTransfer]();
    }

    if (payerIdentification && !paymentReference) {
      return this.builders[StrategySelection.Braintree]();
    }

    if (payerIdentification && paymentReference) {
      return this.builders[StrategySelection.Migration]();
    }

    return null;
  }

  private async getPaymentMethodId(name: string): Promise<PaymentMethodId> {
    const pm = await this.paymentMethodRepo.getPaymentMethodByName(name);
    return pm.paymentMethodId;
  }

  private builders: Builders = {
    [StrategySelection.Braintree]: async () => {
      const id = await this.getPaymentMethodId(PaymentMethodNames.CreditCard);
      return new PaymentStrategy(id, this.braintreePay);
    },
    [StrategySelection.PayPal]: async () => {
      const id = await this.getPaymentMethodId(PaymentMethodNames.PayPal);
      return new PaymentStrategy(id, this.paypalPay);
    },
    [StrategySelection.BankTransfer]: async () => {
      const id = await this.getPaymentMethodId(PaymentMethodNames.BankTransfer);
      return null;
    },
    [StrategySelection.Migration]: async () => {
      const id = await this.getPaymentMethodId(PaymentMethodNames.Migration);
      return null;
    },
  };
}

export {
  StrategySelection as PaymentStrategySelection,
  SelectionData as PaymentStrategySelectionData,
  PaymentStrategyFactory,
};
