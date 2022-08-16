import { EmailRequested as EmailRequestedEvent } from '@hindawi/phenom-events';
import { EventUtils } from '../../../utils/EventUtils';
import { left, right } from '../../../core/logic/Either';
import { UnexpectedError } from '../../../core/logic/AppError';

import { Payer } from '../../../modules/payers/domain/Payer';
import { Invoice } from '../../../modules/invoices/domain/Invoice';
import { SQSPublishServiceContract } from '../../../domain/services/SQSPublishService';
import { Payment } from '../../../modules/payments/domain/Payment';
import { Manuscript } from '../../../modules/manuscripts/domain/Manuscript';

const EMAIL_REQUESTED = 'EmailRequested';

export class CommsEmailService {
  constructor(
    private readonly publishService: SQSPublishServiceContract,
    private readonly basePath: string,
    private readonly senderAddress: string,
    private readonly senderName: string,
    private readonly mailingDisabled: boolean
  ) {}

  private createURL(path: string) {
    return `${this.basePath}${path}`;
  }
  public async sendInvoiceReceiptNotification(
    payer: Payer,
    invoice: Invoice,
    payments: Payment,
    manuscript: Manuscript,
    messageTimestamp?: Date
  ) {
    if (this.mailingDisabled) {
      return right(null);
    }
    const templatePlaceholders = {
      RECEIVER_TITLE: 'Dr',
      INVOICING_PH_1: payer.name.value,
      INVOICE_NUMBER: invoice.persistentReferenceNumber,
      MANUSCRIPT_NUMBER: manuscript.customId,
      AMOUNT: payments.amount.value.toString(),
      BUTTON_LINK: this.createURL(`/payment-details/${invoice.id.toString()}`),
    };

    const data: EmailRequestedEvent = {
      ...EventUtils.createEventObject(),
      sender: { email: this.senderAddress, name: this.senderName },
      recipient: { email: payer.email.toString(), name: payer.name.toString() },
      usecase: 'DownloadReceiptEmail',
      templatePlaceholders,
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: EMAIL_REQUESTED,
        data,
      });
      return right(null);
    } catch (err) {
      return left(new UnexpectedError(err.toString()));
    }
  }
}
