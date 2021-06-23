import { Either } from '../../../../core/logic/Either';

import { GetInvoicePdfAllErrors } from './getInvoicePdfErrors';

export interface PdfResponse {
  fileName: string;
  file: Buffer;
}

export type GetInvoicePdfResponse = Either<GetInvoicePdfAllErrors, PdfResponse>;
