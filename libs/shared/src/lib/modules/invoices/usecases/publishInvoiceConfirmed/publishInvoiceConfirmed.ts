import { InvoiceStatus as PhenomInvoiceStatus } from '@hindawi/phenom-events/src/lib/invoice';
import { InvoiceConfirmed as InvoiceConfirmedEvent } from '@hindawi/phenom-events';

import { AppError } from '../../../../core/logic/AppError';
import { SQSPublishServiceContract } from '../../../../domain/services/SQSPublishService';
import { Invoice } from '../../domain/Invoice';
import { InvoiceItem } from '../../domain/InvoiceItem';
import { Payer } from '../../../payers/domain/Payer';
import { Manuscript } from '../../../manuscripts/domain/Manuscript';
import { Address } from '../../../addresses/domain/Address';
import { EventUtils } from 'libs/shared/src/lib/utils/EventUtils';
import { CouponMap } from '../../../coupons/mappers/CouponMap';
import { WaiverMap } from '../../../waivers/mappers/WaiverMap';

const INVOICE_CONFIRMED = 'InvoiceConfirmed';

export class PublishInvoiceConfirmed {
  constructor(private publishService: SQSPublishServiceContract) {}
  public async execute(
    invoice: Invoice,
    invoiceItems: InvoiceItem[],
    manuscript: Manuscript,
    payer: Payer,
    address: Address
  ): Promise<any> {
    const data: InvoiceConfirmedEvent = {
      ...EventUtils.createEventObject(),
      invoiceId: invoice.id.toString(),
      invoiceCreatedDate: invoice.dateCreated,
      referenceNumber: invoice.referenceNumber,
      invoiceIssueDate: invoice.dateIssued,
      invoiceItems: invoiceItems.map(ii => ({
        id: ii.id.toString(),
        manuscriptCustomId: manuscript.customId,
        manuscriptId: ii.manuscriptId.id.toString(),
        type: ii.type as any,
        price: ii.price,
        vatPercentage: ii.vat,
        coupons: ii.coupons
          ? ii.coupons.map(c => CouponMap.toEvent(c))
          : undefined,
        waivers: ii.waivers
          ? ii.waivers.map(w => WaiverMap.toEvent(w))
          : undefined
      })),
      organization: payer.organization.value.toString(),
      invoiceStatus: invoice.status as PhenomInvoiceStatus,
      payerName: payer.name.value.toString(),
      payerEmail: payer.email.value.toString(),
      payerType: payer.type,
      vatRegistrationNumber: payer.VATId,
      address: `${address.addressLine1}, ${address.city}, ${address.country}`,
      country: address.country,
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
      )
      // couponId: coupon.id,
      // dateApplied: coupon.applied
    };

    try {
      await this.publishService.publishMessage({
        event: INVOICE_CONFIRMED,
        data
      });
    } catch (err) {
      throw new AppError.UnexpectedError(err.toString());
    }
  }
}
