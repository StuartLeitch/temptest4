import { Either, Result } from '../../../../core/logic/Result';

import { GetInvoicePdfErrors } from './getInvoicePdfErrors';

export interface PdfResponse {
  fileName: string;
  file: Buffer;
}

export type GetInvoicePdfResponse = Either<
  GetInvoicePdfErrors,
  Result<PdfResponse>
>;
