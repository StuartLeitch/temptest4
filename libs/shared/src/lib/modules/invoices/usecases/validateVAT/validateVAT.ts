// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';

import { AppError } from '../../../../core/logic/AppError';
import { ValidateVATResponse } from './validateVATResponse';
import { ValidateVATErrors } from './validateVATErrors';
import { VATService } from '../../../../domain/services/VATService';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext,
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

export interface ValidateVATRequestDTO {
  vatNumber: string;
  countryCode: string;
}

export type ValidateVATContext = AuthorizationContext<Roles>;

export class ValidateVATUsecase
  implements
    UseCase<
      ValidateVATRequestDTO,
      Promise<ValidateVATResponse>,
      ValidateVATContext
    >,
    AccessControlledUsecase<
      ValidateVATRequestDTO,
      ValidateVATContext,
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
    context?: ValidateVATContext
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
      return left(new AppError.UnexpectedError(err));
    }
  }
}
