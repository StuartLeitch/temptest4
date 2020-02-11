export interface MigratePayerAddress {
  addressLine2?: string;
  addressLine1: string;
  countryCode: string;
  state?: string;
  city: string;
}

export interface MigratePayer {
  vatRegistrationNumber?: string;
  address: MigratePayerAddress;
  organization?: string;
  email: string;
  name: string;
  type: string;
}

export interface MigrateAPC {
  invoiceReference?: string;
  paymentAmount?: number;
  manuscriptId: string;
  discount?: number;
  price: number;
  vat?: number;
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
