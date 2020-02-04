export interface MigratePayerAddress {
  addressLine2?: string;
  addressLine1: string;
  countryCode: string;
  postalCode: string;
  state?: string;
  city: string;
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

  payerVatRegistrationNumber?: string;
  payerAddress: MigratePayerAddress;
  payerName: string;
  payerType: string;
  apc: MigrateAPC;

  erpReference?: string;
}
