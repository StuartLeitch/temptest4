import { UseCaseError } from '../../../../core/logic/UseCaseError';

export class PdfInvoiceError extends UseCaseError {
  constructor(message: string, invoiceId: string) {
    super(
      `Error when generating the pdf for receipt with id {${invoiceId}}, with error message: ${message}`
    );
  }
}
