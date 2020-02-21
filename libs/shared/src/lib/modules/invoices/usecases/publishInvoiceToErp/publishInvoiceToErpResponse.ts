import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { ErpResponse } from '../../../../domain/services/ErpService';

export type PublishInvoiceToErpResponse = Either<
  AppError.UnexpectedError,
  Result<ErpResponse>
>;
