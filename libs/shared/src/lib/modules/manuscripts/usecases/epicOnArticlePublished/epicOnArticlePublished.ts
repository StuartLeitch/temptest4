// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { InvoiceStatus } from '../../../invoices/domain/Invoice';
import { ManuscriptId } from '../../domain/ManuscriptId';
import { PayerType } from '../../../payers/domain/Payer';

import { AddressMap } from '../../../addresses/mappers/AddressMap';
import { PayerMap } from '../../../payers/mapper/Payer';

import { TransactionRepoContract } from '../../../transactions/repos/transactionRepo';
import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { AddressRepoContract } from '../../../addresses/repos/addressRepo';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';
import { InvoiceRepoContract } from '../../../invoices/repos/invoiceRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { PayerRepoContract } from '../../../payers/repos/payerRepo';

// * Usecase specific

import { EmailService } from '../../../../infrastructure/communication-channels';
import { VATService } from '../../../../domain/services/VATService';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId';
import {
  ConfirmInvoiceUsecase,
  ConfirmInvoiceDTO,
} from '../../../invoices/usecases/confirmInvoice';

import { EpicOnArticlePublishedResponse as Response } from './epicOnArticlePublishedResponse';
import type { EpicOnArticlePublishedDTO as DTO } from './epicOnArticlePublishedDTO';
import * as Errors from './epicOnArticlePublishedErrors';

interface CorrelationContext {
  correlationId: string;
}

type Context = UsecaseAuthorizationContext & CorrelationContext;
export class EpicOnArticlePublishedUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
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
  ) {
    super();
  }

  @Authorize('manuscript:update')
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

    const manuscriptId = ManuscriptId.create(new UniqueEntityID(customId));

    try {
      loggerService.info('Find Manuscript by Custom Id', {
        correlationId: context.correlationId,
        manuscriptId: manuscriptId.id.toString(),
      });
      try {
        const maybeManuscript = await manuscriptRepo.findByCustomId(
          manuscriptId
        );

        if (maybeManuscript.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeManuscript.value.message))
          );
        }

        manuscript = maybeManuscript.value;
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
          `While auto-confirming on article published an error ocurred: ${maybeAutoConfirmed.value.message}`
        );
      }

      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err));
    }
  }

  private async autoConfirmInvoices(
    manuscript: Manuscript,
    emailReceiver: string,
    emailSender: string,
    context: Context
  ): Promise<Either<UnexpectedError, void>> {
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
      return left(
        new UnexpectedError(new Error(maybeInvoiceIds.value.message))
      );
    }

    const invoiceIds = maybeInvoiceIds.value;

    for (const invoiceId of invoiceIds) {
      this.loggerService.info('Get invoice details', {
        correlationId: context.correlationId,
        invoiceId: invoiceId.toString(),
      });

      const maybeInvoice = await this.invoiceRepo.getInvoiceById(invoiceId);

      if (maybeInvoice.isLeft()) {
        return left(new UnexpectedError(new Error(maybeInvoice.value.message)));
      }

      const invoice = maybeInvoice.value;

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

        const maybeNewAddress = AddressMap.toDomain({
          country: manuscript.authorCountry,
        });

        if (maybeNewAddress.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeNewAddress.value.message))
          );
        }

        const newAddress = maybeNewAddress.value;

        // * create new payer
        const maybeNewPayer = PayerMap.toDomain({
          invoiceId: invoiceId.id.toString(),
          name: `${manuscript.authorFirstName} ${manuscript.authorSurname}`,
          email: manuscript.authorEmail,
          addressId: newAddress.addressId.id.toString(),
          organization: ' ',
          type: PayerType.INDIVIDUAL,
        });

        if (maybeNewPayer.isLeft()) {
          return left(
            new UnexpectedError(new Error(maybeNewPayer.value.message))
          );
        }

        const newPayer = maybeNewPayer.value;

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
      }
    }

    return right(null);
  }
}
