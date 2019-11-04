import {Repo} from '../../../infrastructure/Repo';
import {InvoiceItem} from '../domain/InvoiceItem';
import {InvoiceItemId} from '../domain/InvoiceItemId';
import {ManuscriptId} from '../domain/ManuscriptId';
import { InvoiceId } from '../../../shared';

export interface InvoiceItemRepoContract extends Repo<InvoiceItem> {
  getInvoiceItemById(invoiceItemId: InvoiceItemId): Promise<InvoiceItem>;
  getInvoiceItemByManuscriptId(
    manuscriptId: ManuscriptId
  ): Promise<InvoiceItem>;
  getInvoiceItemCollection(): Promise<InvoiceItem[]>;
  delete(invoiceItem: InvoiceItem): Promise<void>;

  getItemsByInvoiceId(invoiceId: InvoiceId): Promise<InvoiceItem[]>;
  // update(invoice: Invoice): Promise<Invoice>;
}
