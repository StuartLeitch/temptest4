import { Either, Result } from '../../../../../core/logic/Result';
import { AppError } from '../../../../.././core/logic/AppError';
import { CatalogItem } from '../../../domain/CatalogItem';


export type GetJournalListResponse = Either<
  AppError.UnexpectedError,
  Result<CatalogItem[]>
>;
