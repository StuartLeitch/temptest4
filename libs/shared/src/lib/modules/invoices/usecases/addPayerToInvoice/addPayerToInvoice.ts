/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { Result, right } from '../../../../core/logic/Result';

// * Authorization Logic
import {
  Authorize,
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

import { AddPayerToInvoiceResponse } from './addPayerToInvoiceResponse';
import { AddPayerToInvoiceDTO } from './addPayerToInvoiceDTO';

import { InvoiceRepoContract } from './../../../invoices/repos/invoiceRepo';

import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { WaiverService } from '../../../../domain/services/WaiverService';
import { VATService } from './../../../../domain/services/VATService';
import { PayerRepoContract } from './../../../payers/repos/payerRepo';

/**
 * @deprecated do not use, will break stuff
 */
export class AddPayerToInvoiceUsecase
  implements
    UseCase<
      AddPayerToInvoiceDTO,
      Promise<AddPayerToInvoiceResponse>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      AddPayerToInvoiceDTO,
      UsecaseAuthorizationContext,
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
    context?: UsecaseAuthorizationContext
  ): Promise<AddPayerToInvoiceResponse> {
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
    //   return left(new UnexpectedError(err));
    // }
    return right(Result.ok(null));
  }
}
