import { UnexpectedError } from '../../../../core/logic/AppError';
import { Result, Either } from '../../../../core/logic/Result';

import { Manuscript } from '../../domain/Manuscript';

import { GetManuscriptByInvoiceIdErrors } from './getManuscriptByInvoiceIdErrors';

export type GetManuscriptByInvoiceIdResponse = Either<
  | GetManuscriptByInvoiceIdErrors.ApcHasNoManuscript
  | GetManuscriptByInvoiceIdErrors.InvalidInvoiceId
  | GetManuscriptByInvoiceIdErrors.NoApcForInvoice
  | UnexpectedError,
  Result<Manuscript[]>
>;
