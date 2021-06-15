import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Payer } from '../../domain/Payer';

export type GetPayerResponse = Either<UnexpectedError, Payer>;
