import { UseCaseError } from '../../../../core/logic/UseCaseError';
import { Result } from '../../../../core/logic/Result';

import { NotificationType } from '../../domain/Notification';

export namespace AreNotificationsPausedErrors {
  export class InvalidNotificationType extends Result<UseCaseError> {
    constructor(type: string) {
      super(false, {
        message: `The provided type {${type}} is not a valid notification type, please use one of ${Object.keys(
          NotificationType
        )}`
      });
    }
  }

  export class NotificationTypeRequired extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Notification type is required.`
      });
    }
  }

  export class InvoiceIdRequired extends Result<UseCaseError> {
    constructor() {
      super(false, {
        message: `Invoice id is required.`
      });
    }
  }

  export class EncounteredDbError extends Result<UseCaseError> {
    constructor(invoiceId: string, e: Error) {
      super(false, {
        message: `While retrieving the notification pauses for invoice id {${invoiceId}} an error war encountered: ${e.message}.`
      });
    }
  }
}
