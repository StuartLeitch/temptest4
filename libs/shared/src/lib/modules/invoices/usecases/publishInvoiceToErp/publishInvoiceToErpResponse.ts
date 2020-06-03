import { Either } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { ErpResponse } from '../../../../domain/services/ErpService';

export type PublishInvoiceToErpResponse = Either<
  AppError.UnexpectedError | any,
  ErpResponse
>;
