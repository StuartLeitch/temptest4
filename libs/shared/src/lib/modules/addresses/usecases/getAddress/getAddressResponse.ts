import { Address } from '../../domain/Address';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either, Result } from '../../../../core/logic/Result';

export type GetAddressResponse = Either<UnexpectedError, Result<Address>>;
