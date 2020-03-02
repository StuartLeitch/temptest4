import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { AggregateRoot } from '../../../core/domain/AggregateRoot';

import { InvoiceId } from '../../invoices/domain/InvoiceId';
import { NotificationId } from './NotificationId';
import { Result } from '../../../core/logic/Result';

export enum NotificationType {
  REMINDER_CONFIRMATION = 'REMINDER_CONFIRMATION',
  SANCTIONED_COUNTRY = 'SANCTIONED_COUNTRY',
  REMINDER_PAYMENT = 'REMINDER_PAYMENT',
  INVOICE_CREATED = 'INVOICE_CREATED'
}

export interface NotificationProps {
  type: NotificationType;
  invoiceId: InvoiceId;
  recipientEmail: string;
  dateSent: Date;
}

export class Notification extends AggregateRoot<NotificationProps> {
  get notificationId(): NotificationId {
    return NotificationId.create(this._id).getValue();
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
  ): Result<Notification> {
    const defaultValues: NotificationProps = {
      dateSent: new Date(),
      ...props
    };

    const notification = new Notification(defaultValues, id);

    return Result.ok(notification);
  }
}
