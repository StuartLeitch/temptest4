import { Either } from '../../../../core/logic/Result';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { ErpResponse } from '../../../../domain/services/ErpService';

export type PublishPaymentToErpResponse = Either<
  UnexpectedError | any,
  ErpResponse
>;