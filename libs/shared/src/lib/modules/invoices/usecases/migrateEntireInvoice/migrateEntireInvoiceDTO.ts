export interface MigratePayerAddress {
  addressLine2?: string;
  addressLine1: string;
  countryCode: string;
  postalCode: string;
  state?: string;
  city: string;
}

export interface MigratePayer {
  vatRegistrationNumber: string;
  address: MigratePayerAddress;
  invoiceId: string;
  email: string;
  name: string;
  type: string;
}

export interface MigrateAPC {
  manuscriptId: string;
  discount: number;
  price: string;
  vat: number;
}

export interface MigrateEntireInvoiceDTO {
  acceptanceDate?: string;
  paymentDate?: string;
  issueDate?: string;

  payer: MigratePayer;
  apc: MigrateAPC;
  erpReference?: string;
}
