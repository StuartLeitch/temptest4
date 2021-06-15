import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either, Result } from '../../../../../core/logic/Result';
import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';

export type RetryCreditNotesResponse = Either<
  UnexpectedError,
  Result<ErpInvoiceResponse[]>
>;
