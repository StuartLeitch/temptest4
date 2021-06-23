import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either, right } from '../../../core/logic/Either';

import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { NotificationId } from './NotificationId';

export enum NotificationType {
  REMINDER_CONFIRMATION = 'REMINDER_CONFIRMATION',
  SANCTIONED_COUNTRY = 'SANCTIONED_COUNTRY',
  REMINDER_PAYMENT = 'REMINDER_PAYMENT',
  INVOICE_CREATED = 'INVOICE_CREATED',
}

export interface NotificationProps {
  type: NotificationType;
  invoiceId: InvoiceId;
  recipientEmail: string;
  dateSent?: Date;
}

export class Notification extends AggregateRoot<NotificationProps> {
  get notificationId(): NotificationId {
    return NotificationId.create(this._id);
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get dateSent(): Date {
    return this.props.dateSent;
  }

  get recipientEmail(): string {
    return this.props.recipientEmail;
  }

  get invoiceId(): InvoiceId {
    return this.props.invoiceId;
  }

  private constructor(props: NotificationProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: NotificationProps,
    id?: UniqueEntityID
  ): Either<GuardFailure, Notification> {
    const defaultValues: NotificationProps = {
      dateSent: new Date(),
      ...props,
    };

    const notification = new Notification(defaultValues, id);

    return right(notification);
  }
}
