import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { Transaction } from '../../domain/Transaction';

export type GetTransactionResponse = Either<UnexpectedError, Transaction>;
