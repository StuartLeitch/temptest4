import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';
import { GuardFailure } from '../../../core/logic/GuardFailure';
import { Either } from '../../../core/logic/Either';

import { Mapper } from '../../../infrastructure/Mapper';

import { NotificationProps, Notification } from '../domain/Notification';
import { InvoiceId } from '../../invoices/domain/InvoiceId';

type MappingProps = Omit<NotificationProps, 'invoiceId'> & {
  id: string | number;
  invoiceId: string;
};

export class NotificationMap extends Mapper<Notification> {
  public static toDomain(
    raw: MappingProps
  ): Either<GuardFailure, Notification> {
    const invoiceUUID = new UniqueEntityID(raw.invoiceId);
    const invoiceId = InvoiceId.create(invoiceUUID);
    const id = new UniqueEntityID(raw.id);

    const props: NotificationProps = {
      recipientEmail: raw.recipientEmail,
      dateSent: raw.dateSent,
      type: raw.type,
      invoiceId,
    };

    const maybeNotification = Notification.create(props, id);

    return maybeNotification;
  }

  public static toPersistence(notification: Notification): MappingProps {
    return {
      invoiceId: notification.invoiceId.id.toString(),
      recipientEmail: notification.recipientEmail,
      dateSent: notification.dateSent,
      id: notification.id.toString(),
      type: notification.type,
    };
  }
}
