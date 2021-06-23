import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';
import { GuardFailure } from '../../../../../core/logic/GuardFailure';
import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';

export type RetryCreditNotesResponse = Either<
  UnexpectedError | GuardFailure,
  ErpInvoiceResponse[]
>;
