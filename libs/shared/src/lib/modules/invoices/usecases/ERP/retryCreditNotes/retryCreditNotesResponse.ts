import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';

export type RetryCreditNotesResponse = Either<
  UnexpectedError,
  ErpInvoiceResponse[]
>;
