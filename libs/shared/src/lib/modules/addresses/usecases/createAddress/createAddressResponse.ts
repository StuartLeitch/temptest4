import {Either, Result} from '../../../../core/logic/Result';
import {AppError} from '../../../../core/logic/AppError';
import {Address} from '../../domain/Address';

export type CreateAddressResponse = Either<
  AppError.UnexpectedError,
  Result<Address>
>;
