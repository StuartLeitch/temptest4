import {BaseController} from '../../../../infrastructure/BaseController';
import {AddEmailToPayerUseCase} from './addEmailToPayer.usecase';

export class AddEmailToPayerController extends BaseController {
  private useCase: AddEmailToPayerUseCase;

  public constructor(useCase: AddEmailToPayerUseCase) {
    super();
    this.useCase = useCase;
  }

  public async executeImpl(): Promise<any> {
    return;
  }
}
