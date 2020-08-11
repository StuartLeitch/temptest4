/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';

import { UnexpectedError } from '../../../../core/logic/AppError';
import { ValidateVATResponse } from './validateVATResponse';
import { ValidateVATErrors } from './validateVATErrors';
import { VATService } from '../../../../domain/services/VATService';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

export interface ValidateVATRequestDTO {
  vatNumber: string;
  countryCode: string;
}

export class ValidateVATUsecase
  implements
    UseCase<
      ValidateVATRequestDTO,
      Promise<ValidateVATResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      ValidateVATRequestDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(private vatService: VATService) {
    this.vatService = vatService;
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('validate:vatnumber')
  public async execute(
    request: ValidateVATRequestDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<ValidateVATResponse> {
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
            return left(
              new ValidateVATErrors.InvalidInputError(vatNumber, countryCode)
            );
          case 'MS_UNAVAILABLE':
            return left(new ValidateVATErrors.ServiceUnavailableError());
        }
      }
      return right(Result.ok<any>(vatResponse));
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
