import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Manuscript } from '../../domain/Manuscript';

import * as Errors from './getManuscriptByInvoiceIdErrors';

export type GetManuscriptByInvoiceIdResponse = Either<
  | Errors.ApcHasNoManuscript
  | Errors.InvalidInvoiceId
  | Errors.NoApcForInvoice
  | UnexpectedError,
  Manuscript[]
>;
