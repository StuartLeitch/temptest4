// * Core Domain
import { Either, Result, right, left } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
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

import { EmailService } from '../../../../infrastructure/communication-channels';
import { LoggerContract } from '../../../../infrastructure/logging/Logger';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { CatalogRepoContract } from '../../../journals/repos/catalogRepo';
import { CouponRepoContract } from '../../../coupons/repos/couponRepo';
import { WaiverRepoContract } from '../../../waivers/repos/waiverRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetItemsForInvoiceUsecase } from '../../../invoices/usecases/getItemsForInvoice/getItemsForInvoice';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetJournal } from '../../../journals/usecases/journals/getJournal/getJournal';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';

import { NotificationType, Notification } from '../../domain/Notification';
import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';

// * Usecase specific
import { SendInvoiceCreditControlReminderResponse as Response } from './sendInvoiceCreditControlReminderResponse';
import { SendInvoiceCreditControlReminderErrors as Errors } from './sendInvoiceCreditControlReminderErrors';
import { SendInvoiceCreditControlReminderDTO as DTO } from './sendInvoiceCreditControlReminderDTO';

import { constructCreditControlReminderData, CompoundData } from './utils';

type Context = AuthorizationContext<Roles>;
export type SendInvoiceCreditControlReminderContext = Context;

export class SendInvoiceCreditControlReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private pausedReminderRepo: PausedReminderRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private journalRepo: CatalogRepoContract,
    private couponRepo: CouponRepoContract,
    private waiverRepo: WaiverRepoContract,
    private loggerService: LoggerContract,
    private emailService: EmailService
  ) {
    this.fetchFromManuscriptsDb = this.fetchFromManuscriptsDb.bind(this);
    this.attachItemsToInvoice = this.attachItemsToInvoice.bind(this);
    this.saveNotification = this.saveNotification.bind(this);
    this.shouldSendEmail = this.shouldSendEmail.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.getCatalogItem = this.getCatalogItem.bind(this);
    this.getPauseStatus = this.getPauseStatus.bind(this);
    this.getManuscript = this.getManuscript.bind(this);
    this.getInvoice = this.getInvoice.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = new AsyncEither<null, DTO>(request)
        .then(this.validateRequest)
        .then(this.getInvoice(context))
        .then(this.attachItemsToInvoice(context))
        .then(this.getManuscript)
        .then(this.getCatalogItem(context))
        .then(this.getPauseStatus(context))
        .advanceOrEnd(this.shouldSendEmail)
        .then(this.sendEmail)
        .then(this.saveNotification);

      const maybeResult = await execution.execute();
      return maybeResult.map(() => Result.ok(null));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(request: DTO) {
    this.loggerService.info(`Validate usecase request data`);

    if (!request.manuscriptCustomId) {
      return left(new Errors.ManuscriptCustomIdRequiredError());
    }
    if (!request.recipientEmail) {
      return left(new Errors.RecipientEmailRequiredError());
    }
    if (!request.recipientName) {
      return left(new Errors.RecipientNameRequiredError());
    }
    if (!request.senderEmail) {
      return left(new Errors.SenderEmailRequiredError());
    }
    if (!request.senderName) {
      return left(new Errors.SenderNameRequiredError());
    }
    return right<null, DTO>(request);
  }

  private getInvoice(context: Context) {
    return async (request: DTO) => {
      this.loggerService.info(
        `Get the details of invoice associated with the manuscript with custom id ${request.manuscriptCustomId}`
      );

      const getInvoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

      const execution = new AsyncEither<null, string>(
        request.manuscriptCustomId
      )
        .then(customId => getInvoiceIdUsecase.execute({ customId }, context))
        .map(result => result.getValue())
        .map(invoiceIds => invoiceIds[0].id.toString())
        .then(invoiceId => invoiceUsecase.execute({ invoiceId }, context))
        .map(result => ({
          ...request,
          invoice: result.getValue()
        }));

      return execution.execute();
    };
  }

  private attachItemsToInvoice(context: Context) {
    const usecase = new GetItemsForInvoiceUsecase(
      this.invoiceItemRepo,
      this.couponRepo,
      this.waiverRepo
    );

    return async (request: DTO & { invoice: Invoice }) => {
      const { invoice } = request;
      const execution = new AsyncEither(invoice.id.toString())
        .then(invoiceId => usecase.execute({ invoiceId }, context))
        .map(result => result.getValue())
        .map(items => {
          items.forEach(item => invoice.addInvoiceItem(item));
          return invoice;
        })
        .map(invoice => ({
          ...request,
          invoice
        }));
      return execution.execute();
    };
  }

  private async fetchFromManuscriptsDb(customId: string) {
    try {
      const result = await this.manuscriptRepo.findByCustomId(customId);
      if (result) {
        return right<Errors.ManuscriptNotFound, Manuscript>(result);
      } else {
        return left<Errors.ManuscriptNotFound, Manuscript>(
          new Errors.ManuscriptNotFound(customId)
        );
      }
    } catch (e) {
      return left<Errors.ManuscriptNotFound, Manuscript>(
        new Errors.ManuscriptNotFound(customId)
      );
    }
  }

  private async getManuscript(request: DTO & { invoice: Invoice }) {
    this.loggerService.info(
      `Get manuscript with custom id ${request.manuscriptCustomId}`
    );

    const execution = new AsyncEither<null, string>(request.manuscriptCustomId)
      .then(this.fetchFromManuscriptsDb)
      .map(manuscript => ({ ...request, manuscript }));
    return execution.execute();
  }

  private getCatalogItem(context: Context) {
    return async (
      request: DTO & { invoice: Invoice; manuscript: Manuscript }
    ) => {
      this.loggerService.info(
        `Get the journal data for manuscript with custom id ${request.manuscriptCustomId}`
      );

      const journalExecution = async (manuscript: Manuscript) =>
        getJournalUsecase.execute({ journalId: manuscript.journalId }, context);
      const getJournalUsecase = new GetJournal(this.journalRepo);
      const execution = new AsyncEither(request)
        .then(this.getManuscript)
        .map(data => data.manuscript)
        .then(journalExecution)
        .map(journalResult => ({
          ...request,
          journal: journalResult.getValue()
        }));
      return execution.execute();
    };
  }

  private getPauseStatus(context: Context) {
    return async (request: CompoundData) => {
      this.loggerService.info(
        `Get the paused status of reminders of type ${
          NotificationType.REMINDER_PAYMENT
        } for invoice with id ${request.invoice.id.toString()}`
      );

      const usecase = new AreNotificationsPausedUsecase(
        this.pausedReminderRepo,
        this.loggerService
      );
      const invoiceId = request.invoice.id.toString();

      const maybeResult = await usecase.execute(
        {
          notificationType: NotificationType.REMINDER_PAYMENT,
          invoiceId
        },
        context
      );

      return maybeResult.map(result => ({
        ...request,
        paused: result.getValue()
      }));
    };
  }

  private async shouldSendEmail({ invoice, paused }: CompoundData) {
    this.loggerService.info(
      `Determine if the reminder, of type ${
        NotificationType.REMINDER_PAYMENT
      }, should be sent, for invoice with id ${invoice.id.toString()}`
    );

    if (invoice.status === InvoiceStatus.ACTIVE && !paused) {
      return right<null, boolean>(true);
    }

    return right<null, boolean>(false);
  }

  private async sendEmail(
    request: CompoundData
  ): Promise<Either<Errors.EmailSendingFailure, DTO>> {
    this.loggerService.info(
      `Send the reminder email for invoice with id ${request.invoice.id.toString()}, to "${
        request.recipientEmail
      }"`
    );

    try {
      const data = constructCreditControlReminderData(request);
      await this.emailService.invoiceCreditControlReminder(data).sendEmail();
      return right(request);
    } catch (e) {
      return left(new Errors.EmailSendingFailure(e));
    }
  }

  private async saveNotification(
    request: CompoundData
  ): Promise<Either<Errors.NotificationDbSaveError, DTO>> {
    this.loggerService.info(
      `Save that a reminder of type ${
        NotificationType.REMINDER_PAYMENT
      } was sent, for invoice with id ${request.invoice.id.toString()}`
    );

    const notification = Notification.create({
      type: NotificationType.REMINDER_PAYMENT,
      recipientEmail: request.recipientEmail,
      invoiceId: request.invoice.invoiceId
    }).getValue();

    try {
      await this.sentNotificationRepo.addNotification(notification);
      return right(request);
    } catch (e) {
      return left(new Errors.NotificationDbSaveError(e));
    }
  }
}
