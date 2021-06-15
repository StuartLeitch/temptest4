import { UnexpectedError } from '../../../.././core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { CheckVatResponse } from '../../../../domain/services/VATService';

import * as Errors from './validateVATErrors';

export type ValidateVATResponse = Either<
  Errors.ServiceUnavailableError | Errors.InvalidInputError | UnexpectedError,
  CheckVatResponse
>;
