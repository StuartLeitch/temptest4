import { differenceInCalendarDays } from 'date-fns';

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

import { SchedulingTime, TimerBuilder, JobBuilder } from '@hindawi/sisif';

import { SchedulerContract } from '../../../../infrastructure/scheduler/Scheduler';
import {
  EmailService,
  PaymentReminderType,
  PaymentReminder
} from '../../../../infrastructure/communication-channels';

import { InvoiceItemRepoContract } from '../../../invoices/repos/invoiceItemRepo';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { ArticleRepoContract } from '../../../manuscripts/repos/articleRepo';
import { CatalogRepoContract } from '../../../journals/repos/catalogRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { GetInvoiceIdByManuscriptCustomIdUsecase } from '../../../invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';
import { GetSentNotificationForInvoiceUsecase } from '../getSentNotificationForInvoice';
import { GetJournal } from '../../../journals/usecases/journals/getJournal/getJournal';
import { AreNotificationsPausedUsecase } from '../areNotificationsPaused';

import { NotificationType, Notification } from '../../domain/Notification';
import { InvoiceStatus, Invoice } from '../../../invoices/domain/Invoice';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { CatalogItem } from '../../../journals/domain/CatalogItem';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';

// * Usecase specific
import { SendInvoicePaymentReminderResponse as Response } from './sendInvoicePaymentReminderResponse';
import { SendInvoicePaymentReminderErrors as Errors } from './sendInvoicePaymentReminderErrors';
import { SendInvoicePaymentReminderDTO as DTO } from './sendInvoicePaymentReminderDTO';

import {
  constructPaymentReminderData,
  numberToTemplateMapper,
  shouldSendEmail,
  CompoundData
} from './utils';

interface DTOWithInvoiceId extends DTO {
  invoiceId: string;
}

type Context = AuthorizationContext<Roles>;
export type SendInvoicePaymentReminderContext = Context;

export class SendInvoicePaymentReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private invoiceItemRepo: InvoiceItemRepoContract,
    private manuscriptRepo: ArticleRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private journalRepo: CatalogRepoContract,
    private scheduler: SchedulerContract,
    private emailService: EmailService
  ) {
    this.sendPaymentReminderEmail = this.sendPaymentReminderEmail.bind(this);
    this.getNotificationsCount = this.getNotificationsCount.bind(this);
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
    const execution = new AsyncEither(request)
      .then(this.getInvoice(context))
      .then(this.getCatalogItem(context))
      .then(this.getPauseStatus(context))
      .advanceOrEnd(shouldSendEmail)
      .then(this.sendPaymentReminderEmail);
    return null;
  }

  private getInvoice(context: Context) {
    return async (data: DTO) => {
      const getInvoiceIdUsecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
        this.manuscriptRepo,
        this.invoiceItemRepo
      );
      const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);

      const execution = new AsyncEither<null, string>(data.manuscriptCustomId)
        .then(customId => getInvoiceIdUsecase.execute({ customId }, context))
        .map(result => result.getValue())
        .map(invoiceIds => invoiceIds[0].id.toString())
        .then(invoiceId => invoiceUsecase.execute({ invoiceId }, context))
        .map(result => ({
          ...data,
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
    return async (data: DTO & { invoice: Invoice }) => {
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

  private getNotificationsCount(invoiceId: InvoiceId) {
    const getNotificationsUsecase = new GetSentNotificationForInvoiceUsecase(
      this.sentNotificationRepo
    );
    const filterPayment = (notification: Notification) =>
      notification.type === NotificationType.REMINDER_PAYMENT;

    const execution = new AsyncEither(invoiceId.id.toString())
      .then(invoiceId => getNotificationsUsecase.execute({ invoiceId }))
      .map(result => result.getValue())
      .map(notifications => notifications.filter(filterPayment))
      .map(notifications => notifications.length);
    return execution.execute();
  }

  private async sendEmail(
    data: CompoundData,
    template: PaymentReminderType
  ): Promise<Either<Errors.EmailSendingFailure, CompoundData>> {
    try {
      const emailData = constructPaymentReminderData(data);
      await this.emailService
        .invoicePaymentReminder(emailData, template)
        .sendEmail();

      return right(data);
    } catch (e) {
      return left(new Errors.EmailSendingFailure(e));
    }
  }

  private sendPaymentReminderEmail(data: CompoundData) {
    const days = differenceInCalendarDays(new Date(), data.invoice.dateIssued);
    const emailNum = Math.trunc(days / data.job.delay);

    return this.sendEmail(data, numberToTemplateMapper[emailNum]);
  }

  private getPauseStatus(context: Context) {
    return async (data: CompoundData) => {
      const usecase = new AreNotificationsPausedUsecase(
        this.sentNotificationRepo
      );

      const { invoice } = data;
      const invoiceId = invoice.id.toString();

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

  private saveNotification(data: CompoundData) {}

  private scheduleNextJob(data: CompoundData) {}
}
