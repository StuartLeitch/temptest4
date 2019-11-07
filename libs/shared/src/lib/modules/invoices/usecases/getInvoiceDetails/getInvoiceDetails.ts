// * Core Domain
import {UseCase} from '../../../../core/domain/UseCase';
import {Result, left, right} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {AppError} from '../../../../core/logic/AppError';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import {AccessControlContext} from '../../../../domain/authorization/AccessControl';
import {Roles} from '../../../users/domain/enums/Roles';

import {Invoice /* , STATUS as InvoiceStatus*/} from '../../domain/Invoice';
import {InvoiceId} from '../../domain/InvoiceId';
import {InvoiceRepoContract} from '../../repos/invoiceRepo';
import {WaiverRepoContract} from '../../../../domain/reductions/repos/waiverRepo';
import {Waiver} from '../../../../domain/reductions/Waiver';
import {WaiverService} from '../../../../domain/services/WaiverService';
// import {WaiverMap} from '../../../../domain/reductions/mappers/WaiverMap';

import {VATService} from './../../../../domain/services/VATService';

// * Usecase specific
import {GetInvoiceDetailsResponse} from './getInvoiceDetailsResponse';
import {GetInvoiceDetailsErrors} from './getInvoiceDetailsErrors';
import {GetInvoiceDetailsDTO} from './getInvoiceDetailsDTO';

export type GetInvoiceDetailsContext = AuthorizationContext<Roles>;

export class GetInvoiceDetailsUsecase
  implements
    UseCase<
      GetInvoiceDetailsDTO,
      Promise<GetInvoiceDetailsResponse>,
      GetInvoiceDetailsContext
    >,
    AccessControlledUsecase<
      GetInvoiceDetailsDTO,
      GetInvoiceDetailsContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private waiverRepo: WaiverRepoContract,
    private vatService: VATService,
    private waiverService: WaiverService
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:read')
  public async execute(
    request: GetInvoiceDetailsDTO,
    context?: GetInvoiceDetailsContext
  ): Promise<GetInvoiceDetailsResponse> {
    let invoice: Invoice;
    let waivers: Waiver | Waiver[];
    let payerFromCountry: string;
    let payerIsAnIndividual: boolean;

    // * get a proper InvoiceId
    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    if ('payerFromCountry' in request) {
      payerFromCountry = request.payerFromCountry;
    }

    if ('payerIsAnIndividual' in request) {
      payerIsAnIndividual = request.payerIsAnIndividual;
    }

    try {
      // * System identifies invoice by Invoice Id
      try {
        invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
      } catch (err) {
        return left(
          new GetInvoiceDetailsErrors.InvoiceNotFoundError(
            invoiceId.id.toString()
          )
        );
      }

      return right(Result.ok<Invoice>(invoice));

      // // * Mark invoice as ACTIVE
      // invoice.markAsActive();

      // // * System identifies the associated waivers, if any
      // waivers = await this.waiverRepo.getWaiversByInvoiceId(invoiceId);

      // let invoiceCharge = invoice.getInvoiceTotal();
      // waivers.forEach((waiver: any) => {
      //   const percentage = waiver.percentage;
      //   invoiceCharge -= invoiceCharge * percentage;
      // });
      // invoice.charge = invoiceCharge;

      // // * Save the newly calculated charge
      // await this.invoiceRepo.update(invoice);

      // // * Apply and save VAT scheme
      // const vat = this.vatService.calculateVAT(
      //   payerFromCountry,
      //   payerIsAnIndividual
      // );
      // invoice.vat = vat;

      // // * Save the associated VAT scheme
      // await this.invoiceRepo.update(invoice);

      // // * This is where all the magic happens
      // return right(Result.ok<Invoice>(invoice));
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
