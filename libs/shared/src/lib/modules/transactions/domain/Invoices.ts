import {WatchedList} from '../../../core/domain/WatchedList';
import {Invoice} from '../../invoices/domain/Invoice';

export class Invoices extends WatchedList<Invoice> {
  private constructor(initialInvoices: Invoice[]) {
    super(initialInvoices);
  }

  public compareItems(a: Invoice, b: Invoice): boolean {
    return a.equals(b);
  }

  public static create(invoices?: Invoice[]): Invoices {
    return new Invoices(invoices ? invoices : []);
  }
}
