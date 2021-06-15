import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { RegisterPaymentResponse } from '../../../../domain/services/ErpService';

export type PublishPaymentToErpResponse = Either<
  UnexpectedError,
  RegisterPaymentResponse
>;
