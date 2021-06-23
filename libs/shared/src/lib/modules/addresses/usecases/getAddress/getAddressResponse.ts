import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Address } from '../../domain/Address';

import * as Errors from './getAddressErrors';

export type GetAddressResponse = Either<
  Errors.AddressNotFoundError | UnexpectedError,
  Address
>;
