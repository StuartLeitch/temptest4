import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

export type AssignEditorsToJournalResponse = Either<UnexpectedError, void>;
