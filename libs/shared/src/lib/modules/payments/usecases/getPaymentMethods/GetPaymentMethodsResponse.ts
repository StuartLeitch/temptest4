import { PaymentMethod } from '../../domain/PaymentMethod';
import { AppError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';
import { PaymentMethodPersistenceDTO } from '../../mapper/PaymentMethod';

export type GetPaymentMethodsResponse = Either<
  AppError.UnexpectedError,
  Result<PaymentMethodPersistenceDTO[]>
>;
