import { AppError } from '../../../../core/logic/AppError';
import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { Invoice } from '../../domain/Invoice';
import { InvoiceMap } from '../../mappers/InvoiceMap';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { InvoiceItemMap } from '../../mappers/InvoiceItemMap';
import { PayerMap } from '../../../payers/mapper/Payer';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';

export class PublishInvoiceConfirmed {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    payer: Payer,
    address: Address
  ): Promise<any> {
    const message = {
      event: 'invoiceConfirmed',
      data: {
        invoiceId: invoice.id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        referenceNumber: `${invoice.invoiceNumber}/${invoice.dateAccepted.getFullYear()}`,
        invoiceIssueDate: invoice.dateIssued,
        invoiceItems: invoiceItems.map(ii => ({
          id: ii.id.toString(),
          manuscriptCustomId: manuscript.customId,
          manuscriptId: ii.manuscriptId.id.toString(),
          type: ii.type,
          price: ii.price,
          vatPercentage: ii.vat,
        })),
        transactionId: invoice.transactionId.id.toString(),
        invoiceStatus: invoice.status,
        payerName: payer.name.value.toString(),
        payerEmail: payer.email.value.toString(),
        payerType: payer.type,
        vatRegistrationNumber: payer.VATId,
        address: `${address.addressLine1}, ${address.city}, ${address.country}`,
        country: address.country,
        valueWithoutVAT: invoiceItems.reduce(
          (acc, curr) => acc + curr.price,
          0
        ),
        valueWithVAT: invoiceItems.reduce(
          (acc, curr) => acc + curr.price * (1 + curr.vat / 100),
          0
        )
        // VAT: "todo"
        // couponId: coupon.id,
        // dateApplied: coupon.applied
      }
    };

    try {
      await this.publishService.publishMessage(message);
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
