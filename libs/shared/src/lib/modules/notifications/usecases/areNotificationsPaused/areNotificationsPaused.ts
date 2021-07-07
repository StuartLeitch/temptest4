// * Core Domain
import { UniqueEntityID } from '../../../../core/domain/UniqueEntityID';
import { Either, right, left } from '../../../../core/logic/Either';
import { UnexpectedError } from '../../../../core/logic/AppError';
import { AsyncEither } from '../../../../core/logic/AsyncEither';
import { UseCase } from '../../../../core/domain/UseCase';

// * Authorization Logic
import type { UsecaseAuthorizationContext as Context } from '../../../../domain/authorization';
import {
  AccessControlledUsecase,
  AccessControlContext,
  Authorize,
} from '../../../../domain/authorization';

import { NotificationPause } from '../../domain/NotificationPause';
import { InvoiceId } from '../../../invoices/domain/InvoiceId';
import { NotificationType } from '../../domain/Notification';

import { PausedReminderRepoContract } from '../../repos/PausedReminderRepo';

import { LoggerContract } from '../../../../infrastructure/logging/Logger';

// * Usecase specific
import { AreNotificationsPausedResponse as Response } from './areNotificationsPausedResponse';
import { AreNotificationsPausedDTO as DTO } from './areNotificationsPausedDTO';
import * as Errors from './areNotificationsPausedErrors';

type TypeToPauseMap = {
  [key in NotificationType]: keyof Omit<NotificationPause, 'invoiceId'>;
};

const notificationTypeToPause: TypeToPauseMap = {
  REMINDER_CONFIRMATION: 'confirmation',
  REMINDER_PAYMENT: 'payment',
  SANCTIONED_COUNTRY: null,
  INVOICE_CREATED: null,
};

export class AreNotificationsPausedUsecase
  extends AccessControlledUsecase<DTO, Context, AccessControlContext>
  implements UseCase<DTO, Promise<Response>, Context> {
  constructor(
    private pausedReminderRepo: PausedReminderRepoContract,
    private loggerService: LoggerContract
  ) {
    super();

    this.fetchNotificationPauses = this.fetchNotificationPauses.bind(this);
    this.validateRequest = this.validateRequest.bind(this);
    this.getPauseStatus = this.getPauseStatus.bind(this);
  }

  @Authorize('reminder:read')
  public async execute(request: DTO, context?: Context): Promise<Response> {
    try {
      const execution = await new AsyncEither(request)
        .then(this.validateRequest)
        .then(this.fetchNotificationPauses)
        .map(this.getPauseStatus(request))
        .execute();
      return execution;
    } catch (e) {
      return left(new UnexpectedError(e));
    }
  }

  private async validateRequest(
    request: DTO
  ): Promise<
    Either<
      | Errors.NotificationTypeRequired
      | Errors.InvalidNotificationType
      | Errors.InvoiceIdRequired,
      DTO
    >
  > {
    this.loggerService.info(`Validate the usecase request data`);

    const { notificationType, invoiceId } = request;

    if (!invoiceId) {
      return left(new Errors.InvoiceIdRequired());
    }

    if (!notificationType) {
      return left(new Errors.NotificationTypeRequired());
    }

    if (!(notificationType in NotificationType)) {
      return left(new Errors.InvalidNotificationType(request.notificationType));
    }

    return right(request);
  }

  private async fetchNotificationPauses(
    request: DTO
  ): Promise<Either<Errors.EncounteredDbError, NotificationPause>> {
    this.loggerService.info(
      `Fetch pause state for reminders of invoice with id ${request.invoiceId}`
    );

    const uuid = new UniqueEntityID(request.invoiceId);
    const invoiceId = InvoiceId.create(uuid);

    try {
      const result = await this.pausedReminderRepo.getNotificationPausedStatus(
        invoiceId
      );

      if (result.isLeft()) {
        return left(
          new Errors.EncounteredDbError(
            invoiceId.toString(),
            new Error(result.value.message)
          )
        );
      }

      return right(result.value);
    } catch (e) {
      return left(new Errors.EncounteredDbError(invoiceId.toString(), e));
    }
  }

  private getPauseStatus(request: DTO) {
    return (pauses: NotificationPause): boolean => {
      this.loggerService.info(
        `Extract pause state for reminders of type ${request.notificationType}`
      );

      const { notificationType } = request;
      return pauses[notificationTypeToPause[notificationType]] || false;
    };
  }
}
