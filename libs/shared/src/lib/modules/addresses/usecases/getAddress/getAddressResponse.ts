import {Address} from '../../domain/Address';
import {AppError} from '../../../../core/logic/AppError';
import {Either, Result} from '../../../../core/logic/Result';

export type GetAddressResponse = Either<
  AppError.UnexpectedError,
  Result<Address>
>;
