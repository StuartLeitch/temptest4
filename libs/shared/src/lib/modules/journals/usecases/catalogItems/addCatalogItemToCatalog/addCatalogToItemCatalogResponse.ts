import { Either, Result } from '../../../../../core/logic/Result';
import { UnexpectedError } from '../../../../../core/logic/AppError';
import { CatalogItem } from './../../../domain/CatalogItem';

import { AddCatalogItemToCatalogErrors } from './addCatalogItemToCatalogErrors';

export type AddCatalogItemToCatalogUseCaseResponse = Either<
  AddCatalogItemToCatalogErrors.PublisherNotFoundError | UnexpectedError,
  Result<CatalogItem>
>;
