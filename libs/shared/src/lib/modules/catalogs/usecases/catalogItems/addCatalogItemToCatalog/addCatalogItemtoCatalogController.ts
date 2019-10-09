import {BaseController} from '../../../../../infrastructure/BaseController';
import {AddCatalogItemToCatalogUseCase} from './addCatalogItemToCatalogUsecase';

export class AddCatalogItemToCatalogController extends BaseController {
  private useCase: AddCatalogItemToCatalogUseCase;

  public constructor(useCase: AddCatalogItemToCatalogUseCase) {
    super();
    this.useCase = useCase;
  }

  public async executeImpl(): Promise<any> {
    // do nothing yet
  }
}
