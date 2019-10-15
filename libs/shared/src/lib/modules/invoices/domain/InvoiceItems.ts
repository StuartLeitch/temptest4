import {WatchedList} from '../../../core/domain/WatchedList';
import {InvoiceItem} from './InvoiceItem';

export class InvoiceItems extends WatchedList<InvoiceItem> {
  private constructor(initialVotes: InvoiceItem[]) {
    super(initialVotes);
  }

  public compareItems(a: InvoiceItem, b: InvoiceItem): boolean {
    return a.equals(b);
  }

  public static create(invoiceItems?: InvoiceItem[]): InvoiceItems {
    return new InvoiceItems(invoiceItems ? invoiceItems : []);
  }
}
