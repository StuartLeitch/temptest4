import {Invoice} from '../../domain/Invoice';
import {AppError} from '../../../../core/logic/AppError';
import {Either, Result} from '../../../../core/logic/Result';

export type ChangeInvoiceStatusResponse = Either<
  AppError.UnexpectedError,
  Result<Invoice>
>;
