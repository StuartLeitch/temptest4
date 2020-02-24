// * Core Domain
import { Result, right, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AppError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';
import {
  AccessControlledUsecase,
  AuthorizationContext,
  Authorize
} from '../../../../domain/authorization/decorators/Authorize';

import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';

import { AddressMap } from '../../../addresses/mappers/AddressMap';
import { PayerMap } from '../../../payers/mapper/Payer';

import { Manuscript } from '../../../manuscripts/domain/Manuscript';
// TODO: Move ManuscriptId to manuscripts domain
import { ManuscriptId } from '../../../invoices/domain/ManuscriptId';
import { InvoiceItem } from '../../../invoices/domain/InvoiceItem';
import { InvoiceStatus } from '../../../invoices/domain/Invoice';
import { PayerType } from '../../../payers/domain/Payer';
import { Invoice } from '../../../invoices/domain/Invoice';

// * Usecase specific
import { EpicOnArticlePublishedResponse as Response } from './epicOnArticlePublishedResponse';
import { EpicOnArticlePublishedErrors as Errors } from './epicOnArticlePublishedErrors';
import { EpicOnArticlePublishedDTO as DTO } from './epicOnArticlePublishedDTO';
import { ConfirmInvoiceUsecase } from '../../../invoices/usecases/confirmInvoice/confirmInvoice';
import { ConfirmInvoiceDTO } from '../../../invoices/usecases/confirmInvoice/confirmInvoiceDTO';
import { EmailService } from '../../../../infrastructure/communication-channels';
import { VATService } from '../../../../domain/services/VATService';

type Context = AuthorizationContext<Roles>;

export class EpicOnArticlePublishedUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private emailService: EmailService,
    private vatService: VATService,
    private loggerService: any
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let manuscript: Manuscript;
    let invoiceItems: InvoiceItem[];
    let invoice: Invoice;

    const {
      manuscriptRepo,
      invoiceItemRepo,
      invoiceRepo,
      addressRepo,
      payerRepo,
      couponRepo,
      waiverRepo,
      emailService,
      vatService,
      loggerService
    } = this;
    const {
      customId,
      published,
      sanctionedCountryNotificationReceiver,
      sanctionedCountryNotificationSender
    } = request;

    // ? Try first a dream code descriptor
    // * It should describe the business rules with minimal amount of implementation details.

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(customId)
    ).getValue();

    try {
      try {
        manuscript = await manuscriptRepo.findByCustomId(manuscriptId);
      } catch (e) {
        return left(new Errors.ManuscriptNotFound(manuscriptId.id.toString()));
      }

      manuscript.markAsPublished(published);
      await manuscriptRepo.update(manuscript);

      try {
        // * System identifies Invoice Item by Manuscript Id
        invoiceItems = await invoiceItemRepo.getInvoiceItemByManuscriptId(
          manuscript.manuscriptId
        );
      } catch (e) {
        return left(
          new Errors.InvoiceItemNotFoundError(
            manuscript.manuscriptId.id.toString()
          )
        );
      }

      const [invoiceId] = invoiceItems.map(ii => ii.invoiceId);

      try {
        invoice = await invoiceRepo.getInvoiceById(invoiceId);
      } catch (err) {
        return left(new Errors.InvoiceIdRequired());
      }

      // if (invoice.getInvoiceTotal() === 0) {
      //   return;
      // }

      // if (typeof manuscript.authorCountry === 'undefined') {
      //   emailService
      //     .autoConfirmMissingCountryNotification(
      //       invoice,
      //       manuscript,
      //       sanctionedCountryNotificationReceiver,
      //       sanctionedCountryNotificationSender
      //     )
      //     .sendEmail();
      // }

      // * create new address
      const newAddress = AddressMap.toDomain({
        country: manuscript.authorCountry
        // ? city: city,
        // ? state: state,
        // ? postalCode: raw.postalCode,
        // ? addressLine1: raw.addressLine1
      });

      // * create new payer
      const newPayer = PayerMap.toDomain({
        // associate payer to the invoice
        invoiceId: invoiceId.id.toString(),
        name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`,
        email: manuscript.authorEmail,
        addressId: newAddress.addressId.id.toString(),
        organization: ' ',
        type: PayerType.INDIVIDUAL
        // ? vatId: payer.vatRegistrationNumber,
      });

      if (invoice.status === InvoiceStatus.DRAFT) {
        const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
          invoiceItemRepo,
          addressRepo,
          invoiceRepo,
          payerRepo,
          couponRepo,
          waiverRepo,
          emailService,
          vatService,
          loggerService
        );

        const confirmInvoiceArgs: ConfirmInvoiceDTO = {
          payer: {
            ...PayerMap.toPersistence(newPayer),
            address: AddressMap.toPersistence(newAddress)
          },
          sanctionedCountryNotificationReceiver,
          sanctionedCountryNotificationSender
        };

        // * Confirm the invoice automagically
        try {
          await confirmInvoiceUsecase.execute(confirmInvoiceArgs);
        } catch (err) {}
      }

      return right(Result.ok<void>());
    } catch (err) {
      return left(new AppError.UnexpectedError(err));
    }
  }
}
