import { Either, Result } from '../../../../core/logic/Result';

import { GetInvoicePdfAllErrors } from './getInvoicePdfErrors';

export interface PdfResponse {
  fileName: string;
  file: Buffer;
}

export type GetInvoicePdfResponse = Either<
  GetInvoicePdfAllErrors,
  Result<PdfResponse>
>;
