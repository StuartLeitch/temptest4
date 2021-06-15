import { UnexpectedError } from '../../../../core/logic/AppError';
import { Either } from '../../../../core/logic/Either';

import { CatalogItem } from '../../domain/CatalogItem';

import * as Errors from './addCatalogItemToCatalogErrors';

export type AddCatalogItemToCatalogUseCaseResponse = Either<
  Errors.PublisherNotFoundError | UnexpectedError,
  CatalogItem
>;
