import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class NoPaymentMethodFound extends UseCaseError {
  constructor(paymentMethodId: string) {
    super(`No payment method with id {${paymentMethodId}} found.`);
  }
}
