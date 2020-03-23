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

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';
import { CatalogRepoContract } from '../../../journals/repos/catalogRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetJournal } from '../../../journals/usecases/journals/getJournal/getJournal';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';

import { NotificationType, Notification } from '../../domain/Notification';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Invoice } from '../../../invoices/domain/Invoice';

// * Usecase specific
import { SendInvoiceCreditControlReminderResponse as Response } from './sendInvoiceCreditControlReminderResponse';
import { SendInvoiceCreditControlReminderErrors as Errors } from './sendInvoiceCreditControlReminderErrors';
import { SendInvoiceCreditControlReminderDTO as DTO } from './sendInvoiceCreditControlReminderDTO';

import {
  constructCreditControlReminderData,
  shouldSendEmail,
  CompoundData
} from './utils';

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
    private emailService: EmailService
  ) {
    this.saveNotification = this.saveNotification.bind(this);
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
        .then(this.getManuscript)
        .then(this.getCatalogItem(context))
        .then(this.getPauseStatus(context))
        .advanceOrEnd(shouldSendEmail)
        .then(this.sendEmail)
        .then(this.saveNotification);

      const maybeResult = await execution.execute();
      return maybeResult.map(() => Result.ok(null));
    } catch (e) {
      return left(new AppError.UnexpectedError(e));
    }
  }

  private async validateRequest(request: DTO) {
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

  private getManuscript(data: DTO & { invoice: Invoice }) {
    const execution = new AsyncEither<null, string>(data.manuscriptCustomId)
      .then(async customId => {
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
      })
      .map(manuscript => ({ ...data, manuscript }));
    return execution.execute();
  }

  private getCatalogItem(context: Context) {
    return async (data: DTO & { invoice: Invoice; manuscript: Manuscript }) => {
      const getJournalUsecase = new GetJournal(this.journalRepo);

      const execution = new AsyncEither(data)
        .then(this.getManuscript)
        .then(async data => {
          const { manuscript } = data;
          const maybeResult = await getJournalUsecase.execute(
            { journalId: manuscript.journalId },
            context
          );
          return maybeResult.map(result => ({
            ...data,
            journal: result.getValue()
          }));
        });
      return execution.execute();
    };
  }

  private getPauseStatus(context: Context) {
    return async (data: CompoundData) => {
      const usecase = new AreNotificationsPausedUsecase(
        this.pausedReminderRepo
      );
      const invoiceId = data.invoice.id.toString();

      const maybeResult = await usecase.execute(
        {
          notificationType: NotificationType.REMINDER_PAYMENT,
          invoiceId
        },
        context
      );

      return maybeResult.map(result => ({
        ...data,
        paused: result.getValue()
      }));
    };
  }

  private async sendEmail(
    request: CompoundData
  ): Promise<Either<Errors.EmailSendingFailure, DTO>> {
    try {
      const data = constructCreditControlReminderData(request);
      const result = await this.emailService
        .invoiceCreditControlReminder(data)
        .sendEmail();
      return right(request);
    } catch (e) {
      return left(new Errors.EmailSendingFailure(e));
    }
  }

  private async saveNotification(
    request: CompoundData
  ): Promise<Either<Errors.NotificationDbSaveError, DTO>> {
    try {
      const notification = Notification.create({
        type: NotificationType.REMINDER_PAYMENT,
        recipientEmail: request.recipientEmail,
        invoiceId: request.invoice.invoiceId
      }).getValue();

      await this.sentNotificationRepo.addNotification(notification);
      return right(request);
    } catch (e) {
      return left(new Errors.NotificationDbSaveError(e));
    }
  }
}
