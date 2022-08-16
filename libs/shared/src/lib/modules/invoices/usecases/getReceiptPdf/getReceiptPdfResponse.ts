import { Either } from '../../../../core/logic/Either';

import { PdfInvoiceError } from './getReceiptErrors';

export interface PdfResponse {
  fileName: string;
  file: Buffer;
}

export type GetReceiptPdfResponse = Either<PdfInvoiceError, PdfResponse>;
