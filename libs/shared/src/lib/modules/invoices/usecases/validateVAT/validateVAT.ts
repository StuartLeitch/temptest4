// * Core Domain
import { UnexpectedError } from '../../../../core/logic/AppError';
import { right, left } from '../../../../core/logic/Either';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { VATService } from '../../../../domain/services/VATService';

import { ValidateVATResponse as Response } from './validateVATResponse';
import { ValidateVATRequestDTO as DTO } from './validateVATDTO';
import * as Errors from './validateVATErrors';

export class ValidateVATUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(private vatService: VATService) {
    super();

    this.vatService = vatService;
  }

  @Authorize('VAT:validate')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const { vatNumber, countryCode } = request;

    try {
      // * validate VAT number against country code
      const vatResponse = await this.vatService.checkVAT({
        vatNumber,
        countryCode,
      });
      if (vatResponse instanceof Error) {
        switch (vatResponse.message) {
          case 'INVALID_INPUT':
            return left(new Errors.InvalidInputError(vatNumber, countryCode));
          case 'MS_UNAVAILABLE':
            return left(new Errors.ServiceUnavailableError());
          default:
            return left(new UnexpectedError(vatResponse));
        }
      } else {
        return right(vatResponse);
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
