import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import { ErpRevRecResponse } from '../../../../../domain/services/ErpService';

import * as Errors from './publishRevenueRecognitionReversal.errors';

export type PublishRevenueRecognitionReversalResponse = Either<
  | Errors.InvoiceManuscriptNotFoundError
  | Errors.InvoiceAddressNotFoundError
  | Errors.InvoicePayersNotFoundError
  | Errors.InvoiceItemsNotFoundError
  | Errors.InvoiceNotFoundError
  | UnexpectedError,
  ErpRevRecResponse
>;
