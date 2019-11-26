export interface MigrateInvoiceDTO {
  invoiceId: string;
  vatValue: number;
  invoiceReference: string;
  discount: number;
  APC: number;
  dateIssued: string;
}
