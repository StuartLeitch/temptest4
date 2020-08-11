import { StrategyFactory } from '../../../../core/logic/strategy/strategy-factory';

import { PaymentMethodNames } from '../PaymentMethod';
import { PaymentMethodId } from '../PaymentMethodId';

import { PaymentMethodRepoContract } from '../../repos';

import { PaymentStrategy } from './payment-strategy';
import {
  BraintreeClientToken,
  PayPalCaptureMoney,
  EmptyCaptureMoney,
  BraintreePayment,
  EmptyClientToken,
  IdentityPayment,
  PayPalPayment,
} from './behaviors';

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
    private braintreeClientToken: BraintreeClientToken,
    private braintreePayment: BraintreePayment,
    private emptyClientToken: EmptyClientToken,
    private paypalCapture: PayPalCaptureMoney,
    private identityPayment: IdentityPayment,
    private emptyCapture: EmptyCaptureMoney,
    private paypalPayment: PayPalPayment,
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
      return new PaymentStrategy(
        this.braintreeClientToken,
        this.emptyCapture,
        this.braintreePayment,
        id
      );
    },
    [StrategySelection.PayPal]: async () => {
      const id = await this.getPaymentMethodId(PaymentMethodNames.PayPal);
      return new PaymentStrategy(
        this.emptyClientToken,
        this.paypalCapture,
        this.paypalPayment,
        id
      );
    },
    [StrategySelection.BankTransfer]: async () => {
      const id = await this.getPaymentMethodId(PaymentMethodNames.BankTransfer);
      return new PaymentStrategy(
        this.emptyClientToken,
        this.emptyCapture,
        this.identityPayment,
        id
      );
    },
    [StrategySelection.Migration]: async () => {
      const id = await this.getPaymentMethodId(PaymentMethodNames.Migration);
      return new PaymentStrategy(
        this.emptyClientToken,
        this.emptyCapture,
        this.identityPayment,
        id
      );
    },
  };
}

export {
  StrategySelection as PaymentStrategySelection,
  SelectionData as PaymentStrategySelectionData,
  PaymentStrategyFactory,
};
