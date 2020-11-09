import { Either, Result } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';
import * as Errors from './publishRevenueRecognitionReversal.errors';

export type PublishRevenueRecognitionReversalResponse = Either<
  | Errors.InvoiceNotFoundError
  | Errors.InvoiceItemsNotFoundError
  | Errors.InvoicePayersNotFoundError
  | Errors.InvoiceAddressNotFoundError
  | Errors.InvoiceManuscriptNotFoundError
  | UnexpectedError,
  Result<ErpInvoiceResponse>
>;
