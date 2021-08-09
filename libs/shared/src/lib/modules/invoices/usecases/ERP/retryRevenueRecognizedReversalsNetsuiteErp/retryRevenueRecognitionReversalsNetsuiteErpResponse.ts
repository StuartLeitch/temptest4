import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import { ErpRevRecResponse } from '../../../../../domain/services/ErpService';

export type RetryRevenueRecognitionReversalsNetsuiteErpResponse = Either<
  UnexpectedError,
  ErpRevRecResponse[]
>;
