import { ErpResponse } from 'libs/shared/src/lib/domain/services/ErpService';
import { Either, Result } from 'libs/shared/src/lib/core/logic/Result';
import { AppError } from 'libs/shared/src/lib/core/logic/AppError';

export type PublishInvoiceToErpResponse = Either<AppError.UnexpectedError, Result<ErpResponse>>;
