import { Either, Result } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { ErpResponse } from '../../../../../domain/services/ErpService';

export type PublishRevenueRecognitionToErpResponse = Either<
  UnexpectedError,
  Result<ErpResponse>
>;
