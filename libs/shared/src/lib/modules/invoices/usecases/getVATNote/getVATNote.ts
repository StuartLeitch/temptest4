// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
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

// * Usecase specific
import { VATService } from '../../../../domain/services/VATService';

import { PayerType } from '../../../payers/domain/Payer';
import { Payer } from '../../../payers/domain/Payer';
import { InvoiceId } from '../../domain/InvoiceId';

import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';

import { GetVATNoteResponse as Response } from './getVATNoteResponse';
import type { GetVATNoteDTO as DTO } from './getVATNoteDTO';
import * as Errors from './getVATNoteErrors';

export class GetVATNoteUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private vatService: VATService
  ) {
    super();
  }

  @Authorize('invoice:applyVAT')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const invoiceId = InvoiceId.create(new UniqueEntityID(request.invoiceId));

    try {
      let payer: Payer;
      try {
        const maybePayer = await this.payerRepo.getPayerByInvoiceId(invoiceId);

        if (maybePayer.isLeft()) {
          return left(new UnexpectedError(new Error(maybePayer.value.message)));
        }
        payer = maybePayer.value;
      } catch (err) {
        console.log(err);
        return left(new Errors.PayerNotFoundError(invoiceId.id.toString()));
      }

      let vatNote = ' ';
      if (payer && payer.billingAddressId) {
        const maybeAddress = await this.addressRepo.findById(
          payer.billingAddressId
        );
        // * Get the VAT note for the invoice item

        if (maybeAddress.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeAddress.value.message))
          );
        }

        const address = maybeAddress.value;

        const { template } = this.vatService.getVATNote(
          {
            postalCode: address.postalCode,
            countryCode: address.country,
            stateCode: address.state,
          },
          payer.type !== PayerType.INSTITUTION,
          new Date(request?.dateIssued)
        );
        vatNote = template;
      }

      return right(vatNote);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }
}
