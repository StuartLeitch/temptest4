// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Result, left, right} from '../../../../core/logic/Result';
import {AppError} from '../../../../core/logic/AppError';
// import {TextUtil} from '../../../../utils/TextUtil';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

import {CreatePaymentResponse} from './CreatePaymentResponse';
import {CreatePaymentErrors} from './CreatePaymentErrors';
import {CreatePaymentDTO} from './CreatePaymentDTO';

import {Payment} from '../../domain/Payment';
import {PaymentRepoContract} from '../../repos/paymentRepo';
// import {ArticleRepoContract} from '../../../articles/repos/articleRepo';
// import {Article} from '../../../articles/domain/Article';
// import {JournalId} from './../../../catalogs/domain/JournalId';
// import {ArticleId} from '../../../articles/domain/ArticleId';
// import {CatalogItem} from './../../../catalogs/domain/CatalogItem';
// import {Invoice, InvoiceStatus} from './../../../invoices/domain/Invoice';
// import {InvoiceItem} from './../../../invoices/domain/InvoiceItem';
// import {InvoiceRepoContract} from './../../../invoices/repos/invoiceRepo';
// import {InvoiceItemRepoContract} from './../../../invoices/repos/invoiceItemRepo';
// import {ManuscriptId} from '../../../invoices/domain/ManuscriptId';
// import {CatalogRepoContract} from './../../../catalogs/repos/catalogRepo';

export type CreatePaymentContext = AuthorizationContext<Roles>;

export class CreatePaymentUsecase
  implements
    UseCase<
      CreatePaymentDTO,
      Promise<CreatePaymentResponse>,
      CreatePaymentContext
    >,
    AccessControlledUsecase<
      CreatePaymentDTO,
      CreatePaymentContext,
      AccessControlContext
    > {
  constructor(private paymentRepo: PaymentRepoContract) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('payment:create')
  public async execute(
    request: CreatePaymentDTO,
    context?: CreatePaymentContext
  ): Promise<CreatePaymentResponse> {
    const paymentProps = {
      // status: TransactionStatus.DRAFT
    } as any;

    try {
      // * System creates a new payment
      const paymentOrError: Result<Payment> = Payment.create(paymentProps);

      if (paymentOrError.isFailure) {
        return left(paymentOrError);
      }

      const payment = paymentOrError.getValue();

      await this.paymentRepo.save(payment);

      return right(Result.ok<Payment>(payment));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
