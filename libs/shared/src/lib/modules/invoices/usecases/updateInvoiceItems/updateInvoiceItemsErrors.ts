import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class InvoiceItemNotFound extends UseCaseError {
  constructor(invoiceItemId: string) {
    super(
      `The Invoice Item with Invoice Item id {${invoiceItemId}} could not be found.`
    );
  }
}
