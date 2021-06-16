import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PayerNotFoundError extends UseCaseError {
  constructor(invoiceId: string) {
    super(`Could not find a Payer associated with Invoice id {${invoiceId}}.`);
  }
}
