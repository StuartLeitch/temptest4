import { UseCaseError } from '../../../../core/logic/UseCaseError';

export type AllMigrateEntireInvoiceErrors =
  | MigrationPaymentMethodNotFound
  | StateIsRequiredForUnitedStates
  | AddingMigrationWaiverError
  | AddressLine1Required
  | ManuscriptIdRequired
  | PayerAddressRequired
  | CountryCodeRequired
  | IncorrectPayerType
  | ManuscriptNotFound
  | PostalCodeRequired
  | InvoiceIdRequired
  | InvoiceSaveFailed
  | PayerNameRequired
  | PayerTypeRequired
  | TransactionError
  | CityRequired
  | ApcRequired;

export type PayerAddressErrors =
  | StateIsRequiredForUnitedStates
  | AddressLine1Required
  | PayerAddressRequired
  | CountryCodeRequired
  | PostalCodeRequired
  | CityRequired;

export type ApcErrors = ManuscriptIdRequired | ManuscriptNotFound | ApcRequired;

enum MtsInvoiceStatus {
  PrePaidDomainMembership = 'PrePaidDomainMembership',
  AnnualDomainMembership = 'AnnualDomainMembership',
  LessThanChargedPages = 'LessThanChargedPages',
  InvitedContribution = 'InvitedContribution',
  GEWaivedManuscript = 'GEWaivedManuscript',
  PersonalMembership = 'PersonalMembership',
  RedirectManuscript = 'RedirectManuscript',
  FreeSubjectarea = 'FreeSubjectarea',
  PartiallyPaid = 'PartiallyPaid',
  WaivedCountry = 'WaivedCountry',
  SCOAP3Funded = 'SCOAP3Funded',
  WaivedEditor = 'WaivedEditor',
  GrantWaiver = 'Grant Waiver',
  WaivedIssue = 'WaivedIssue',
  FreePeriod = 'FreePeriod',
  WaivedOnce = 'WaivedOnce',
  FreeTypes = 'FreeTypes',
  Spotlight = 'Spotlight',
  BadDebts = 'BadDebts',
  NoPolicy = 'NoPolicy',
  Outlook = 'Outlook',
  UnPaid = 'UnPaid',
  Waived = 'Waived',
  Paid = 'Paid',
}

export class ManuscriptIdRequired extends UseCaseError {
  constructor() {
    super(`Manuscript id is required.`);
  }
}

export class InvoiceSaveFailed extends UseCaseError {
  constructor(invoiceId: string, err: Error) {
    super(`Saving invoice with id {${invoiceId}} encountered error: ${err}.`);
  }
}

export class InvoiceIdRequired extends UseCaseError {
  constructor() {
    super(`Invoice id is required.`);
  }
}

export class ManuscriptNotFound extends UseCaseError {
  constructor(id: string) {
    super(`The Manuscript with id {${id}} does not exists.`);
  }
}

export class PayerAddressRequired extends UseCaseError {
  constructor() {
    super(
      `Address of payer is required, with the following fields: addressLine1, countryCode, city, postalCode, state (if country is US) and optionally addressLine2 `
    );
  }
}

export class MigrationPaymentMethodNotFound extends UseCaseError {
  constructor() {
    super(`Migration payment method not found.`);
  }
}

export class StateIsRequiredForUnitedStates extends UseCaseError {
  constructor() {
    super(`State is required in address for when the country code is {US}.`);
  }
}

export class CountryCodeRequired extends UseCaseError {
  constructor() {
    super(`Country Code is required for payer address.`);
  }
}

export class PostalCodeRequired extends UseCaseError {
  constructor() {
    super(`Postal code is required for payer address.`);
  }
}

export class AddressLine1Required extends UseCaseError {
  constructor() {
    super(`Address line 1 is required for payer address.`);
  }
}

export class CityRequired extends UseCaseError {
  constructor() {
    super(`City is required for payer address.`);
  }
}

export class PayerTypeRequired extends UseCaseError {
  constructor() {
    super(`Payer type is required.`);
  }
}

export class IncorrectPayerType extends UseCaseError {
  constructor(type: string) {
    super(
      `The provided payer type {${type}} is incorrect, it must be "INDIVIDUAL" or "INSTITUTION".`
    );
  }
}

export class ApcRequired extends UseCaseError {
  constructor() {
    super(
      `APC is required, with the following fields: manuscriptId, price, vat and discount.`
    );
  }
}

export class PayerNameRequired extends UseCaseError {
  constructor() {
    super(`Payer name is required, it must contain First Name and Last Name.`);
  }
}

export class TransactionError extends UseCaseError {
  constructor(message: string) {
    super(message);
  }
}

export class AddingMigrationWaiverError extends UseCaseError {
  constructor(id: string, err: Error) {
    super(
      `While adding the migration waiver for invoice with id {${id}} an error was encountered: ${err.message}. Stack: ${err.stack}`
    );
  }
}
