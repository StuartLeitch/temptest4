import { GuardFailure } from '../../../../core/logic/GuardFailure';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';
import { Address } from '../../domain/Address';

import * as Errors from './createAddressErrors';

export type CreateAddressResponse = Either<
  Errors.InvalidPostalCode | UnexpectedError | GuardFailure,
  Address
>;
