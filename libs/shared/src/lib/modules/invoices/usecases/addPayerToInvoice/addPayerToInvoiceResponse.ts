import {Either, Result} from '../../../../core/logic/Result';
import {AppError} from '../../../.././core/logic/AppError';
import {Invoice} from '../../domain/Invoice';

export type AddPayerToInvoiceResponse = Either<
  AppError.UnexpectedError | Result<any>,
  Result<Invoice>
>;
