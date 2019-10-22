// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../core/logic/Result';

import {AppError} from '../../../../core/logic/AppError';
import {RefreshVATRatesResponse} from './refreshVATRatesResponse';
// import {ValidateVATErrors} from './ValidateVATErrors';

import {VATService} from '../../../../domain/services/VATService';
import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

export interface RefreshVATRatesRequestDTO {
  countryCode?: string;
}

export type RefreshVATRatesContext = AuthorizationContext<Roles>;

export class RefreshVATRatesUsecase
  implements
    UseCase<
      RefreshVATRatesRequestDTO,
      Promise<RefreshVATRatesResponse>,
      RefreshVATRatesContext
    >,
    AccessControlledUsecase<
      RefreshVATRatesRequestDTO,
      RefreshVATRatesContext,
      AccessControlContext
    > {
  constructor(private vatService: VATService) {
    this.vatService = vatService;
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('refresh:vatrates')
  public async execute(
    request: RefreshVATRatesRequestDTO,
    context?: RefreshVATRatesContext
  ): Promise<RefreshVATRatesResponse> {
    const {countryCode} = request;

    try {
      // * check VAT rate against country code, if set
      const vatRatesResponse = await this.vatService.getRates(countryCode);

      // if (vatRatesResponse instanceof Error) {
      //   return left(
      //     new RefreshVATRatesErrors.InvalidInputError(vatNumber, countryCode)
      //   );
      // }

      return right(Result.ok<any>(vatRatesResponse));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
