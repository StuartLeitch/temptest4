// * Core Domain
import { UseCase } from '../../../../core/domain/UseCase';
import { AppError } from '../../../../core/logic/AppError';
import { Result, left, right } from '../../../../core/logic/Result';
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { AsyncEither } from '../../../../core/logic/AsyncEither';

// * Authorization Logic
import {
  Authorize,
  AuthorizationContext,
  AccessControlledUsecase
} from '../../../../domain/authorization/decorators/Authorize';
import { AccessControlContext } from '../../../../domain/authorization/AccessControl';
import { Roles } from '../../../users/domain/enums/Roles';

import { EmailService } from '../../../../infrastructure/communication-channels';
import { SentNotificationRepoContract } from '../../repos/SentNotificationRepo';
import { InvoiceRepoContract } from '../../../invoices/repos';

import { Invoice } from '../../../invoices/domain/Invoice';
import { Notification } from '../../domain/Notification';

import { GetInvoiceDetailsUsecase } from '../../../invoices/usecases/getInvoiceDetails/getInvoiceDetails';

// * Usecase specific
import { SendInvoiceConfirmationReminderResponse as Response } from './SendInvoiceConfirmationReminderResponse';
import { SendInvoiceConfirmationReminderErrors as Errors } from './SendInvoiceConfirmationReminderErrors';
import { SendInvoiceConfirmationReminderDTO as DTO } from './SendInvoiceConfirmationReminderDTO';

type Context = AuthorizationContext<Roles>;
export type SendInvoiceConfirmationReminderContext = Context;

export class SendInvoiceConfirmationReminderUsecase
  implements
    UseCase<DTO, Promise<Response>, Context>,
    AccessControlledUsecase<DTO, Context, AccessControlContext> {
  constructor(
    private sentNotificationRepo: SentNotificationRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private emailService: EmailService
  ) {
    this.decideOnSideEffects = this.decideOnSideEffects.bind(this);
    this.performSideEffects = this.performSideEffects.bind(this);
    this.saveNotification = this.saveNotification.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.scheduleTask = this.scheduleTask.bind(this);
    this.getInvoice = this.getInvoice.bind(this);
    this.sendEmail = this.sendEmail.bind(this);
  }

  private async getAccessControlContext(request, context?) {
    return {};
  }

  // @Authorize('invoice:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    const execution = new AsyncEither<null, DTO>(request)
      .then(this.validateRequest)
      .then(this.getInvoice)
      .then(this.decideOnSideEffects(request));

    const maybeResult = await execution.execute();
    return maybeResult.map(val => Result.ok(val));
  }

  private async validateRequest(request: DTO) {
    if (!request.invoiceId) {
      return left(new Errors.InvoiceIdRequiredError());
    }
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

  private decideOnSideEffects(request: DTO) {
    return async (invoice: Invoice) => {
      if (invoice.dateAccepted && !invoice.dateIssued) {
        return this.performSideEffects(request);
      }
      return right<null, null>(null);
    };
  }

  private async getInvoice({ invoiceId }: DTO) {
    const invoiceUsecase = new GetInvoiceDetailsUsecase(this.invoiceRepo);
    const maybeResult = await invoiceUsecase.execute({ invoiceId });
    return maybeResult.map(result => result.getValue());
  }

  private async performSideEffects(request: DTO) {
    return new AsyncEither<null, DTO>(request)
      .then(this.sendEmail)
      .then(this.saveNotification)
      .then(this.scheduleTask)
      .execute();
  }

  private async sendEmail(request: DTO) {
    const result = await this.emailService
      .invoiceConfirmationReminder({
        author: {
          email: request.recipientEmail,
          name: request.recipientName
        },
        sender: {
          email: request.senderEmail,
          name: request.senderName
        },
        articleCustomId: request.manuscriptCustomId,
        invoiceId: request.invoiceId
      })
      .sendEmail();
    return right<null, any>(result);
  }

  private async saveNotification() {
    return right<null, null>(null);
  }

  private async scheduleTask() {
    return right<null, null>(null);
  }
}
