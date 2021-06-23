import { UnexpectedError } from '../../../../.././core/logic/AppError';
import { Either } from '../../../../../core/logic/Either';

import { CatalogItem } from '../../../domain/CatalogItem';

export type GetJournalListResponse = Either<UnexpectedError, CatalogItem[]>;
