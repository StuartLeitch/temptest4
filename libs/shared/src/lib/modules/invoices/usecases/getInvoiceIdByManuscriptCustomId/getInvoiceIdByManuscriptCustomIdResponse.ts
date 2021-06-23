import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import * as Errors from './getInvoiceIdByManuscriptCustomIdErrors';
import { InvoiceId } from './../../domain/InvoiceId';

export type GetInvoiceIdByManuscriptCustomIdResponse = Either<
  | Errors.InvoiceItemNotFoundError
  | Errors.ManuscriptNotFoundError
  | UnexpectedError,
  InvoiceId[]
>;
