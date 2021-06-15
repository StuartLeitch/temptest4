export interface CreatePayerRequestDTO {
  invoiceId: string;
  type: string;
  name: string;
  email?: string;
  vatId?: string;
  organization?: string;
  addressId?: string;
}
