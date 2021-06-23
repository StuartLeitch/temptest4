import { Either } from '../../../../../core/logic/Either';
import { GuardFailure } from '../../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { ErpInvoiceResponse } from '../../../../../domain/services/ErpService';

export type PublishCreditNoteToErpResponse = Either<
  UnexpectedError | GuardFailure,
  ErpInvoiceResponse
>;
