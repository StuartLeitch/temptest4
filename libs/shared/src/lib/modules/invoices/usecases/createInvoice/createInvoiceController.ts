import {ExpressController} from '../../../../infrastructure/http/models/implementations/expressController';
import {DecodedExpressRequest} from '../../../../infrastructure/http/models/implementations/expressDecodedRequest';

import {CreateInvoiceUsecase} from './createInvoice';
import {CreateInvoiceRequestDTO} from './createInvoiceDTO';
import {CreateInvoiceErrors} from './createInvoiceErrors';

export class CreateInvoiceController extends ExpressController {
  private useCase: CreateInvoiceUsecase;

  constructor(useCase: CreateInvoiceUsecase) {
    super();
    this.useCase = useCase;
  }

  async executeImpl(): Promise<any> {
    const req = this.req as DecodedExpressRequest;
    const {userId} = req.decoded;

    const dto: CreateInvoiceRequestDTO = {
      transactionId: !!this.req.body.transactionId
        ? this.req.body.transactionId
        : null
    };

    try {
      const result = await this.useCase.execute(dto);

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case CreateInvoiceErrors.TransactionNotFoundError:
            return this.notFound(error.errorValue().message);
          default:
            return this.fail(error.errorValue().message);
        }
      } else {
        return this.ok(this.res);
      }
    } catch (err) {
      return this.fail(err);
    }
  }
}
