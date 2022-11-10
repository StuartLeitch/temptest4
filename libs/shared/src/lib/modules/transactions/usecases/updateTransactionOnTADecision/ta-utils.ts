import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';

import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';
import { AddressMap } from '../../../addresses/mappers/AddressMap';
import { Invoice } from '../../../invoices/domain/Invoice';
import { CatalogItem } from '../../../journals/domain/CatalogItem';
import { Payer, PayerType } from '../../../payers/domain/Payer';
import { PayerMap } from '../../../payers/mapper/Payer';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';

import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';

import { LoggerContract } from '../../../../infrastructure/logging';
import { EmailService } from '../../../../infrastructure/communication-channels';
import { VATService } from '../../../../domain/services/VATService';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { TransactionRepoContract } from '../../repos/transactionRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { CouponRepoContract } from '../../../coupons/repos';
import { WaiverRepoContract } from '../../../waivers/repos';

import type { UpdateTransactionOnTADecisionDTO as DTO } from './updateTransactionOnTADecisionDTO';

import {
  ConfirmInvoiceUsecase,
  ConfirmInvoiceDTO,
} from '../../../invoices/usecases/confirmInvoice';
import {DomainEvents} from "../../../../core/domain/events/DomainEvents";

export enum Actions {
  Activate = 'Activate',
  Delete = 'Delete',
  Ignore = 'Ignore',
}

export class UpdateTransactionOnTAUtils {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private addressRepo: AddressRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private payerRepo: PayerRepoContract,
    private logger: LoggerContract,
    private emailService: EmailService,
    private vatService: VATService
  ) {}

  public async confirmInvoice(
    manuscript: Manuscript,
    invoice: Invoice,
    context: Context
  ): Promise<Either<UnexpectedError, void>> {
    const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
      this.invoiceItemRepo,
      this.transactionRepo,
      this.addressRepo,
      this.invoiceRepo,
      this.couponRepo,
      this.waiverRepo,
      this.payerRepo,
      this.logger,
      this.vatService
    );

    const maybeNewAddress = this.makeAddress(manuscript);

    if (maybeNewAddress.isLeft()) {
      return left(
        new UnexpectedError(new Error(maybeNewAddress.value.message))
      );
    }

    const newAddress = maybeNewAddress.value;

    const maybeNewPayer = this.makePayer(manuscript, invoice, newAddress);

    if (maybeNewPayer.isLeft()) {
      return left(new UnexpectedError(new Error(maybeNewPayer.value.message)));
    }

    const newPayer = maybeNewPayer.value;

    const confirmInvoiceArgs: ConfirmInvoiceDTO = {
      payer: {
        ...PayerMap.toPersistence(newPayer),
        address: AddressMap.toPersistence(newAddress),
      },
    };

    try {
      const maybeConfirmed = await confirmInvoiceUsecase.execute(
        confirmInvoiceArgs,
        context
      );
      if (maybeConfirmed.isLeft()) {
        return maybeConfirmed.map(() => null);
      }
    } catch (err) {
      return left(new UnexpectedError(err));
    }
    return right(null);
  }

  public decideHowTheNextSubmissionStatusShouldChangeAccordingToCurrentFlags(
    taEligible: boolean,
    taApproved: boolean,
    dateAccepted: Date,
    datePublished: Date
  ): Actions {
    const isAccepted = Boolean(dateAccepted);
    const isPublished = Boolean(datePublished);
    if (!taEligible && isAccepted) {
      return Actions.Activate;
    } else if(taEligible && !isAccepted && !taApproved) {
      return Actions.Ignore;
    } else if (taEligible && isAccepted && !taApproved) {
      return Actions.Activate;
    } else if (taEligible && isAccepted && !taApproved && isPublished) {
      return Actions.Activate;
    } else if (taEligible && isAccepted && taApproved) {
      return Actions.Delete;
    }
  }

  private makeAddress(
    manuscript: Manuscript
  ): Either<UnexpectedError, Address> {
    const maybeNewAddress = AddressMap.toDomain({
      country: manuscript.authorCountry,
    });

    if (maybeNewAddress.isLeft()) {
      return left(
        new UnexpectedError(new Error(maybeNewAddress.value.message))
      );
    }

    const newAddress = maybeNewAddress.value;
    return right(newAddress);
  }

  private makePayer(
    manuscript: Manuscript,
    invoice: Invoice,
    address: Address
  ): Either<UnexpectedError, Payer> {
    const maybeNewPayer = PayerMap.toDomain({
      invoiceId: invoice.invoiceId.id.toString(),
      name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`,
      addressId: address.addressId.id.toString(),
      email: manuscript.authorEmail,
      type: PayerType.INDIVIDUAL,
      organization: ' ',
    });

    if (maybeNewPayer.isLeft()) {
      return left(new UnexpectedError(new Error(maybeNewPayer.value.message)));
    }

    const newPayer = maybeNewPayer.value;
    return right(newPayer);
  }

  public async sendEmail(
    manuscript: Manuscript,
    invoice: Invoice,
    catalogItem: CatalogItem,
    invoiceItem: InvoiceItem,
    request: DTO
  ): Promise<void> {
    await this.emailService
      .createInvoicePaymentTemplate(
        manuscript,
        catalogItem,
        invoiceItem,
        invoice,
        request.bankTransferCopyReceiver,
        request.emailSenderInfo.address,
        request.emailSenderInfo.name
      )
      .sendEmail();
  }
}
