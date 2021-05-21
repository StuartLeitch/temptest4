/* eslint-disable @typescript-eslint/no-unused-vars */

// * Core Domain
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  AccessControlledUsecase,
  UsecaseAuthorizationContext,
  AccessControlContext,
} from '../../../../domain/authorization';

// * Usecase specific
// import { InvoiceItemRepoContract } from '../../repos/invoiceItemRepo';

import { GetVATNoteResponse as Response } from './getVATNoteResponse';
import * as Errors from './getVATNoteErrors';
import { GetVATNoteDTO } from './getVATNoteDTO';
import { PayerType } from '../../../payers/domain/Payer';
import { InvoiceId } from '../../domain/InvoiceId';

import { VATService } from '../../../../domain/services/VATService';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { Payer } from '../../../payers/domain/Payer';

export class GetVATNoteUsecase
  implements
    UseCase<
      GetVATNoteDTO,
      Promise<Response>,
      UsecaseAuthorizationContext
    >,
    AccessControlledUsecase<
      GetVATNoteDTO,
      UsecaseAuthorizationContext,
      AccessControlContext
    > {
  constructor(
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private vatService: VATService
  ) {}

  // @Authorize('invoice:read')
  public async execute(
    request: GetVATNoteDTO,
    context?: UsecaseAuthorizationContext
  ): Promise<Response> {
    let vatNote: string;

    const invoiceId = InvoiceId.create(
      new UniqueEntityID(request.invoiceId)
    ).getValue();

    try {
      let payer: Payer;
      try {
        payer = await this.payerRepo.getPayerByInvoiceId(invoiceId);
      } catch (err) {
        console.log(err);
        return left(
          new Errors.PayerNotFoundError(
            invoiceId.id.toString()
          )
        );
      }

      let vatnote = ' ';
      if (payer && payer.billingAddressId) {
        const address = await this.addressRepo.findById(payer.billingAddressId);
        // * Get the VAT note for the invoice item
        const { template } = this.vatService.getVATNote(
          {
            postalCode: address.postalCode,
            countryCode: address.country,
            stateCode: address.state,
          },
          payer.type !== PayerType.INSTITUTION,
          new Date(request?.dateIssued)
        );
        vatnote = template;
      }

      return right(vatnote);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
