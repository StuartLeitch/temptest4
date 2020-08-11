import { UnexpectedError } from '../../../../../core/logic/AppError';
import { Either, Result } from '../../../../../core/logic/Result';

import { GetJournalErrors } from './getJournalErrors';
import { CatalogItem } from './../../../domain/CatalogItem';

export type GetJournalResponse = Either<
  GetJournalErrors.JournalDoesntExistError | UnexpectedError | Result<any>,
  Result<CatalogItem>
>;
