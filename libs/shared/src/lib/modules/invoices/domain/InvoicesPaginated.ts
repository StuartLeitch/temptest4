import { Invoice } from './Invoice';

export interface InvoicePaginated {
  invoices: Array<Invoice>;
  totalCount: string;
}
