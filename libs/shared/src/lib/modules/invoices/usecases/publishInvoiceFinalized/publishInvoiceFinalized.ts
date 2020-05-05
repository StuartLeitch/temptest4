import { InvoiceStatus as PhenomInvoiceStatus } from '@hindawi/phenom-events/src/lib/invoice';
// import { InvoiceConfirmed as InvoiceConfirmedEvent } from '@hindawi/phenom-events';

import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { AppError } from '../../../../core/logic/AppError';
import { EventUtils } from '../../../../utils/EventUtils';

import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { Invoice } from '../../domain/Invoice';

import { CouponMap } from '../../../coupons/mappers/CouponMap';
import { WaiverMap } from '../../../waivers/mappers/WaiverMap';

const INVOICE_FINALIZED = 'InvoiceFinalized';

export class PublishInvoiceFinalized {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    payer: Payer,
    address: Address,
    messageTimestamp?: Date
  ): Promise<any> {
    // const data: InvoiceConfirmedEvent
    const data = {
      ...EventUtils.createEventObject(),
      invoiceId: invoice.id.toString(),
      isCreditNote: !!invoice.cancelledInvoiceReference,
      erpReference: invoice.erpReference,
      invoiceCreatedDate: invoice.dateCreated.toISOString(),
      invoiceAcceptedDate: invoice.dateAccepted.toISOString(),
      referenceNumber:
        invoice.cancelledInvoiceReference === null
          ? invoice.referenceNumber
          : `CN-${invoice.referenceNumber}`,
      invoiceIssueDate: invoice.dateIssued.toISOString(),
      cancelledInvoiceReference: invoice.cancelledInvoiceReference,
      invoiceItems: invoiceItems.map((ii) => ({
        id: ii.id.toString(),
        manuscriptCustomId: manuscript.customId,
        manuscriptId: ii.manuscriptId.id.toString(),
        type: ii.type as any,
        price: ii.price,
        vatPercentage: ii.vat,
        coupons: ii.coupons
          ? ii.coupons.map((c) => CouponMap.toEvent(c))
          : undefined,
        waivers: ii.waivers
          ? ii.waivers.map((w) => WaiverMap.toEvent(w))
          : undefined,
      })),
      organization: payer ? payer.organization?.value.toString() : null,
      invoiceStatus: invoice.status as PhenomInvoiceStatus,
      payerName: payer ? payer.name.value.toString() : null,
      payerEmail: payer ? payer.email.value.toString() : null,
      payerType: payer ? payer.type : null,
      vatRegistrationNumber: payer ? payer.VATId : null,
      address: address
        ? `${address.addressLine1}, ${address.city}, ${address.country}`
        : null,
      country: address?.country,
      valueWithoutVAT: invoiceItems.reduce(
        (acc, curr) => acc + curr.calculatePrice(),
        0
      ),
      valueWithVAT: invoiceItems.reduce(
        (acc, curr) => acc + curr.calculatePrice() * (1 + curr.vat / 100),
        0
      ),
      VAT: invoiceItems.reduce(
        (acc, item) => acc + item.calculatePrice() * (item.vat / 100),
        0
      ),
    };

    try {
      await this.publishService.publishMessage({
        timestamp: messageTimestamp?.toISOString(),
        event: INVOICE_FINALIZED,
        data,
      });
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
