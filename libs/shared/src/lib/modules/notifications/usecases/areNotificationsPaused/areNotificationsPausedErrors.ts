import { UseCaseError } from '../../../../core/logic/UseCaseError';

import { NotificationType } from '../../domain/Notification';

export class InvalidNotificationType extends UseCaseError {
  constructor(type: string) {
    super(
      `The provided type {${type}} is not a valid notification type, please use one of ${Object.keys(
        NotificationType
      )}`
    );
  }
}

export class NotificationTypeRequired extends UseCaseError {
  constructor() {
    super(`Notification type is required.`);
  }
}

export class InvoiceIdRequired extends UseCaseError {
  constructor() {
    super(`Invoice id is required.`);
  }
}

export class EncounteredDbError extends UseCaseError {
  constructor(invoiceId: string, e: Error) {
    super(
      `While retrieving the notification pauses for invoice id {${invoiceId}} an error was encountered: ${e.message}.`
    );
  }
}
