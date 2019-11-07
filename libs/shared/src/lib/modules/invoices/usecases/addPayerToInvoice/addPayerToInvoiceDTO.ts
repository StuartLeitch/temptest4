export interface GetInvoiceDetailsDTO {
  invoiceId: string;
  payer: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    country: string;
    city: string;
  };
}
