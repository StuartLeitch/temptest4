import {Payer} from '../../domain/Payer';
import {AppError} from '../../../../core/logic/AppError';
import {Either, Result} from '../../../../core/logic/Result';

export type UpdatePayerResponse = Either<
  AppError.UnexpectedError,
  Result<Payer>
>;
