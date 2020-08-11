import { Either, Result } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../.././core/logic/AppError';
import { CatalogItem } from '../../../domain/CatalogItem';

export type GetJournalListResponse = Either<
  UnexpectedError,
  Result<CatalogItem[]>
>;
