import { StrategyFactory } from '../../../../core/logic/strategy/strategy-factory';

import { PaymentMethodNames } from '../PaymentMethod';
import { PaymentMethodId } from '../PaymentMethodId';

import { PaymentMethodRepoContract } from '../../repos';

import { PaymentStrategy } from './payment-strategy';
import {
  BankTransferCreateClientTokenBehavior,
  BraintreeCreateClientTokenBehavior,
  BankTransferCaptureMoneyBehavior,
  PayPalCreateClientTokenBehavior,
  BraintreeCaptureMoneyBehavior,
  BankTransferPaymentBehavior,
  PayPalCaptureMoneyBehavior,
  BraintreePaymentBehavior,
  PayPalPaymentBehavior,
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
    private bankTransferClientToken: BankTransferCreateClientTokenBehavior,
    private bankTransferCapture: BankTransferCaptureMoneyBehavior,
    private bankTransferPayment: BankTransferPaymentBehavior,
    private braintreeClientToken: BraintreeCreateClientTokenBehavior,
    private braintreeCapture: BraintreeCaptureMoneyBehavior,
    private braintreePayment: BraintreePaymentBehavior,
    private paypalClientToken: PayPalCreateClientTokenBehavior,
    private paypalCapture: PayPalCaptureMoneyBehavior,
    private paypalPayment: PayPalPaymentBehavior,
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
        this.braintreeCapture,
        this.braintreePayment,
        id
      );
    },
    [StrategySelection.PayPal]: async () => {
      const id = await this.getPaymentMethodId(PaymentMethodNames.PayPal);
      return new PaymentStrategy(
        this.paypalClientToken,
        this.paypalCapture,
        this.paypalPayment,
        id
      );
    },
    [StrategySelection.BankTransfer]: async () => {
      const id = await this.getPaymentMethodId(PaymentMethodNames.BankTransfer);
      return new PaymentStrategy(
        this.bankTransferClientToken,
        this.bankTransferCapture,
        this.bankTransferPayment,
        id
      );
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
