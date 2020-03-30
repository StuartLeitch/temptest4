// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';

import { AppError } from '../../../../core/logic/AppError';
import { AddPayerToInvoiceErrors } from './addPayerToInvoiceErrors';
import { AddPayerToInvoiceResponse } from './addPayerToInvoiceResponse';
import { AddPayerToInvoiceDTO } from './addPayerToInvoiceDTO';

import { Invoice } from '../../../invoices/domain/Invoice';
import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';

import {
  Authorize,
  AccessControlledUsecase,
  AuthorizationContext
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
// import {PayerId} from '../../../payers/domain/PayerId';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { WaiverService } from '../../../../domain/services/WaiverService';
import { VATService } from './../../../../domain/services/VATService';
import { WaiverCollection } from '../../../waivers/domain/Waiver';
import { PayerRepoContract } from './../../../payers/repos/payerRepo';
import { Payer } from './../../../payers/domain/Payer';
import { PayerMap } from './../../../payers/mapper/Payer';

export type AddPayerToInvoiceContext = AuthorizationContext<Roles>;

/**
 * @deprecated do not use, will break stuff
 */
export class AddPayerToInvoiceUsecase
  implements
    UseCase<
      AddPayerToInvoiceDTO,
      Promise<AddPayerToInvoiceResponse>,
      AddPayerToInvoiceContext
    >,
    AccessControlledUsecase<
      AddPayerToInvoiceDTO,
      AddPayerToInvoiceContext,
      AccessControlContext
    > {
  constructor(
    private invoiceRepo: InvoiceRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private vatService: VATService,
    private waiverService: WaiverService
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  @Authorize('invoice:update')
  public async execute(
    request: AddPayerToInvoiceDTO,
    context?: AddPayerToInvoiceContext
  ): Promise<AddPayerToInvoiceResponse> {
    let invoice: Invoice;
    let payer: Payer;
    let waivers: WaiverCollection;

    // * get a proper InvoiceId
    // const invoiceId = InvoiceId.create(
    //   new UniqueEntityID(request.invoiceId)
    // ).getValue();

    // try {
    //   try {
    //     payer = PayerMap.toDomain({
    //       ...request.payer
    //     });
    //   } catch (err) {
    //     return left(
    //       new AddPayerToInvoiceErrors.InvoiceNotFoundError(
    //         invoiceId.id.toString()
    //       )
    //     );
    //   }

    //   await this.payerRepo.save(payer);

    //   try {
    //     invoice = await this.invoiceRepo.getInvoiceById(invoiceId);
    //   } catch (err) {
    //     return left(
    //       new AddPayerToInvoiceErrors.InvoiceNotFoundError(
    //         invoiceId.id.toString()
    //       )
    //     );
    //   }

    //   invoice.payerId = payer.payerId;

    //   // * Mark invoice as ACTIVE
    //   invoice.markAsActive();

    //   // * System identifies the associated waivers, if any
    //   waivers = await this.waiverRepo.getWaiversByInvoiceId(invoiceId);

    //   let invoiceCharge = invoice.getInvoiceTotal();
    //   waivers.forEach((waiver: any) => {
    //     const percentage = waiver.percentage;
    //     invoiceCharge -= invoiceCharge * percentage;
    //   });
    //   invoice.charge = invoiceCharge;

    //   // * Save the newly calculated charge
    //   await this.invoiceRepo.update(invoice);

    //   // * Save the associated VAT scheme
    //   await this.invoiceRepo.update(invoice);

    //   return right(Result.ok<Invoice>(invoice));
    // } catch (err) {
    //   return left(new AppError.UnexpectedError(err));
    // }
    return right(Result.ok(null));
  }
}
