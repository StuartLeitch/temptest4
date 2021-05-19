// * Core Domain
import { Result, right, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import {
  AccessControlledUsecase,
  AccessControlContext,
  AuthorizationContext,
  Roles,
} from '../../../../domain/authorization';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
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
import { InvoiceStatus } from '../../../invoices/domain/Invoice';
import { PayerType } from '../../../payers/domain/Payer';

// * Usecase specific
import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId';
import { ConfirmInvoiceUsecase } from '../../../invoices/usecases/confirmInvoice/confirmInvoice';
import { ConfirmInvoiceDTO } from '../../../invoices/usecases/confirmInvoice/confirmInvoiceDTO';

import { EmailService } from '../../../../infrastructure/communication-channels';
import { VATService } from '../../../../domain/services/VATService';

import { EpicOnArticlePublishedResponse as Response } from './epicOnArticlePublishedResponse';
import { EpicOnArticlePublishedErrors as Errors } from './epicOnArticlePublishedErrors';
import { EpicOnArticlePublishedDTO as DTO } from './epicOnArticlePublishedDTO';

interface CorrelationContext {
  correlationId: string;
}
type Context = AuthorizationContext<Roles> & CorrelationContext;

export class EpicOnArticlePublishedUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private invoiceItemRepo: InvoiceItemRepoContract,
    private transactionRepo: TransactionRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private payerRepo: PayerRepoContract,
    private addressRepo: AddressRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private emailService: EmailService,
    private vatService: VATService,
    private loggerService: LoggerContract
  ) {}

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    let manuscript: Manuscript;

    const {
      manuscriptRepo,
      invoiceItemRepo,
      invoiceRepo,
      loggerService,
    } = this;
    const {
      customId,
      published,
      sanctionedCountryNotificationReceiver,
      sanctionedCountryNotificationSender,
    } = request;
    (manuscriptRepo as any).correlationId = context.correlationId;
    (invoiceRepo as any).correlationId = context.correlationId;
    (invoiceItemRepo as any).correlationId = context.correlationId;

    // * It should describe the business rules with minimal amount of implementation details.

    const manuscriptId = ManuscriptId.create(
      new UniqueEntityID(customId)
    ).getValue();

    try {
      loggerService.info('Find Manuscript by Custom Id', {
        correlationId: context.correlationId,
        manuscriptId: manuscriptId.id.toString(),
      });
      try {
        manuscript = await manuscriptRepo.findByCustomId(manuscriptId);
      } catch (e) {
        return left(new Errors.ManuscriptNotFound(manuscriptId.id.toString()));
      }

      loggerService.info('Mark Manuscript as Published', {
        correlationId: context.correlationId,
        manuscriptId: manuscriptId.id.toString(),
      });
      manuscript.markAsPublished(published);

      try {
        await manuscriptRepo.update(manuscript);
      } catch (e) {
        this.loggerService.error(
          `While updating the manuscript with it's published date an error ocurred: ${e.message}, with stack: ${e.stack}`
        );
      }

      const maybeAutoConfirmed = await this.autoConfirmInvoices(
        manuscript,
        sanctionedCountryNotificationReceiver,
        sanctionedCountryNotificationSender,
        context
      );

      if (maybeAutoConfirmed.isLeft()) {
        this.loggerService.error(
          `While auto-confirming on article published an error ocurred: ${
            maybeAutoConfirmed.value.errorValue().message
          }`
        );
      }

      return right(Result.ok<void>());
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async autoConfirmInvoices(
    manuscript: Manuscript,
    emailReceiver: string,
    emailSender: string,
    context: Context
  ) {
    const getInvoiceIds = new GetInvoiceIdByManuscriptCustomIdUsecase(
      this.manuscriptRepo,
      this.invoiceItemRepo
    );

    this.loggerService.info('Find Invoice Ids by Manuscript Id', {
      correlationId: context.correlationId,
      manuscriptId: manuscript.id.toString(),
    });

    const maybeInvoiceIds = await getInvoiceIds.execute({
      customId: manuscript.customId,
    });

    if (maybeInvoiceIds.isLeft()) {
      return maybeInvoiceIds;
    }

    const invoiceIds = maybeInvoiceIds.value.getValue();

    for (const invoiceId of invoiceIds) {
      this.loggerService.info('Get invoice details', {
        correlationId: context.correlationId,
        invoiceId: invoiceId.toString(),
      });

      const invoice = await this.invoiceRepo.getInvoiceById(invoiceId);

      if (
        !invoice.cancelledInvoiceReference &&
        invoice.status === InvoiceStatus.DRAFT
      ) {
        if (typeof manuscript.authorCountry === 'undefined') {
          this.loggerService.info('sendEmail', {
            correlationId: context.correlationId,
            invoiceId: invoiceId.id.toString(),
            manuscriptIdId: manuscript.manuscriptId.id.toString(),
            sanctionedCountryNotificationReceiver: emailReceiver,
            sanctionedCountryNotificationSender: emailSender,
          });
          this.emailService
            .autoConfirmMissingCountryNotification(
              invoice,
              manuscript,
              emailReceiver,
              emailSender
            )
            .sendEmail();
        }

        const newAddress = AddressMap.toDomain({
          country: manuscript.authorCountry,
        });

        // * create new payer
        const newPayer = PayerMap.toDomain({
          invoiceId: invoiceId.id.toString(),
          name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`,
          email: manuscript.authorEmail,
          addressId: newAddress.addressId.id.toString(),
          organization: ' ',
          type: PayerType.INDIVIDUAL,
        });

        const confirmInvoiceUsecase = new ConfirmInvoiceUsecase(
          this.invoiceItemRepo,
          this.transactionRepo,
          this.addressRepo,
          this.invoiceRepo,
          this.couponRepo,
          this.waiverRepo,
          this.payerRepo,
          this.loggerService,
          this.emailService,
          this.vatService
        );

        const confirmInvoiceArgs: ConfirmInvoiceDTO = {
          payer: {
            ...PayerMap.toPersistence(newPayer),
            address: AddressMap.toPersistence(newAddress),
          },
          sanctionedCountryNotificationReceiver: emailReceiver,
          sanctionedCountryNotificationSender: emailSender,
        };

        this.loggerService.info('Try to auto-confirm invoice', {
          correlationId: context.correlationId,
          invoiceId: invoiceId.toString(),
        });

        // * Confirm the invoice automagically
        try {
          const resp = await confirmInvoiceUsecase.execute(
            confirmInvoiceArgs,
            context
          );
          if (resp.isLeft()) {
            return left(
              new UnexpectedError(
                new Error(
                  `While auto-confirming on article published an error ocurred: ${JSON.stringify(
                    resp.value
                  )}`
                )
              )
            );
          }
        } catch (err) {
          return left(new UnexpectedError(err));
        }
      } else {
        return right<Result<UnexpectedError>, void>(null);
      }
    }
  }
}
