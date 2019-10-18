// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../core/logic/Result';
// import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';

import {AppError} from '../../../../core/logic/AppError';

// import {UpdateTransactionOnAcceptManuscriptResponse} from './updateTransactionOnAcceptManuscriptResponse';
import {ValidateVATResponse} from './ValidateVATResponse';
import {ValidateVATErrors} from './ValidateVATErrors';

// import {Invoice} from '../../../invoices/domain/Invoice';
// import {CatalogItem} from './../../../catalogs/domain/CatalogItem';
// import {InvoiceItem} from '../../../invoices/domain/InvoiceItem';
// import {TransactionRepoContract} from '../../repos/transactionRepo';
// import {InvoiceRepoContract} from './../../../invoices/repos/invoiceRepo';
// import {InvoiceItemRepoContract} from './../../../invoices/repos/invoiceItemRepo';
import {VATService} from '../../../invoices/domain/services/VATService';
// import {Transaction} from '../../domain/Transaction';
// import {Article} from '../../../articles/domain/Article';
// import {ArticleRepoContract} from './../../../articles/repos/articleRepo';
// import {ManuscriptId} from './../../../invoices/domain/ManuscriptId';
// import {CatalogRepoContract} from './../../../catalogs/repos/catalogRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

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
    const {vatNumber, countryCode} = request;

    try {
      // * validate VAT number against country code
      const vatResponse = await this.vatService.checkVAT({
        vatNumber,
        countryCode
      });

      if (vatResponse instanceof Error) {
        return left(
          new ValidateVATErrors.InvalidInputError(vatNumber, countryCode)
        );
      }

      return right(Result.ok<any>(vatResponse));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
