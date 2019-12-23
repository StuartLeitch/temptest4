export interface InvoiceView {
  // PDF, UI, Event, etc.
  invoiceId: string;
  payerDetails: object | null; // countries, states, emails, types
  articleDetails: object; // journal titles & shit
  paymentDetails: object; //
  invoiceItems: InvoiceItemView[];
  price: number; // without vat
  vatPercentage: number;
  vatNote: string;
  currency: string; // USD
  currencySymbol: string; // $$
}

// includes discounts
interface InvoiceItemView {
  price: number;
  type: string; // enum InvoiceItemViewType VAT discount apc print order
  note?: string; // Processing charges, 30% Coupon for processing charges,
}
