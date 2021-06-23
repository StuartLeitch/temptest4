import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PayerNotFoundError extends UseCaseError {
  constructor(payerId: string) {
    super(`Couldn't find a Payer with Payer id {${payerId}}.`);
  }
}
