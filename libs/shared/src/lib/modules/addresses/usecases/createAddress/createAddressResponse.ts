import { Either, Result } from '../../../../core/logic/Result';
import { AppError } from '../../../../core/logic/AppError';
import { Address } from '../../domain/Address';

import { CreateAddressErrors } from './createAddressErrors';

export type CreateAddressResponse = Either<
  CreateAddressErrors.InvalidPostalCode | AppError.UnexpectedError,
  Result<Address>
>;
