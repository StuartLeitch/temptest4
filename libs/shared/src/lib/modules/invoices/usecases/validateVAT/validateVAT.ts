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
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(private vatService: VATService) {
    this.vatService = vatService;
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('validate:vatnumber')
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
