import {UseCase} from '../../../../../core/domain/UseCase';
import {Result} from '../../../../../core/logic/Result';

import {CatalogItem} from '../../../domain/CatalogItem';
import {CatalogRepoContract} from '../../../repos/catalogRepo';

interface GetAllCatalogItemsUseCaseRequestDTO {}

export class GetAllCatalogItemsUseCase
  implements
    UseCase<GetAllCatalogItemsUseCaseRequestDTO, Result<CatalogItem[]>> {
  private catalogRepo: CatalogRepoContract;

  constructor(catalogRepo: CatalogRepoContract) {
    this.catalogRepo = catalogRepo;
  }

  private async getCatalogItems(): Promise<Result<CatalogItem[]>> {
    const catalogItems = await this.catalogRepo.getCatalogCollection();

    if (!catalogItems) {
      return Result.fail<CatalogItem[]>(`Couldn't list CatalogItem(s).`);
    }

    return Result.ok<CatalogItem[]>(catalogItems);
  }

  public async execute(
    request: GetAllCatalogItemsUseCaseRequestDTO
  ): Promise<Result<CatalogItem[]>> {
    try {
      const catalogItemsOrError = await this.getCatalogItems();
      if (catalogItemsOrError.isFailure) {
        return Result.fail<CatalogItem[]>(catalogItemsOrError.error);
      }
      const catalogItems = catalogItemsOrError.getValue();

      // magic happens here
      return Result.ok<CatalogItem[]>(catalogItems);
    } catch (err) {
      return Result.fail<CatalogItem[]>(err);
    }
  }
}
