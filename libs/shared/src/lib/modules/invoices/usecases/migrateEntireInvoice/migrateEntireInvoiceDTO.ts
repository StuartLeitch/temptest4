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
  email: string;
  name: string;
  type: string;
}

export interface MigrateAPC {
  paymentAmount: number;
  manuscriptId: string;
  discount: number;
  price: string;
  vat: number;
}

export interface MigrateEntireInvoiceDTO {
  acceptanceDate?: string;
  submissionDate?: string;
  paymentDate?: string;
  issueDate?: string;

  erpReference?: string;
  payer: MigratePayer;
  invoiceId: string;
  apc: MigrateAPC;
}
