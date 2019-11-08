export interface AddPayerToInvoiceDTO {
  invoiceId: string;
  payer: {
    type: string;
    name: string;
    surname: string;
    email: string;
    address: string;
    country: string;
    city: string;
  };
}
