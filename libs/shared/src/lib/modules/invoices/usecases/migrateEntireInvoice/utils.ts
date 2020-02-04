import { left, right, Either } from '../../../../core/logic/Result';

import { PayerType } from '../../../payers/domain/Payer';

import {
  MigrateEntireInvoiceDTO,
  MigratePayerAddress,
  MigrateAPC
} from './migrateEntireInvoiceDTO';
import {
  MigrateEntireInvoiceErrors,
  PayerAddressErrors,
  AllMigrateEntireInvoiceErrors
} from './migrateEntireInvoiceErrors';

type ValidateMainRequestReturn = Either<
  | MigrateEntireInvoiceErrors.PayerNameRequired
  | MigrateEntireInvoiceErrors.PayerTypeRequired
  | MigrateEntireInvoiceErrors.IncorrectPayerType,
  MigrateEntireInvoiceDTO
>;

type ValidateApcReturn = Either<
  | MigrateEntireInvoiceErrors.ManuscriptIdRequired
  | MigrateEntireInvoiceErrors.ApcRequired,
  MigrateAPC
>;

type ValidatePayerAddressReturn = Either<
  PayerAddressErrors,
  MigratePayerAddress
>;

type ValidateRequestReturn = Either<
  AllMigrateEntireInvoiceErrors,
  MigrateEntireInvoiceDTO
>;

export function validateRequest(
  request: MigrateEntireInvoiceDTO
): ValidateRequestReturn {
  const result = validateMainRequestArguments(request)
    .chain(() => validatePayerAddress(request.payerAddress))
    .chain(() => validateAPC(request.apc))
    .map(() => request);
  return result;
}

function validateMainRequestArguments(
  request: MigrateEntireInvoiceDTO
): ValidateMainRequestReturn {
  if (!request.payerName) {
    return left(new MigrateEntireInvoiceErrors.PayerNameRequired());
  }
  if (!request.payerType) {
    return left(new MigrateEntireInvoiceErrors.PayerTypeRequired());
  }
  if (!(request.payerType in PayerType)) {
    return left(
      new MigrateEntireInvoiceErrors.IncorrectPayerType(request.payerType)
    );
  }
  return right(request);
}

function validateAPC(apc: MigrateAPC): ValidateApcReturn {
  if (!apc) {
    return left(new MigrateEntireInvoiceErrors.ApcRequired());
  }
  if (!apc.manuscriptId) {
    return left(new MigrateEntireInvoiceErrors.ManuscriptIdRequired());
  }

  return right(apc);
}

function validatePayerAddress(
  payerAddress: MigratePayerAddress
): ValidatePayerAddressReturn {
  if (!payerAddress) {
    return left(new MigrateEntireInvoiceErrors.PayerAddressRequired());
  }
  if (!payerAddress.addressLine1) {
    return left(new MigrateEntireInvoiceErrors.AddressLine1Required());
  }
  if (!payerAddress.city) {
    return left(new MigrateEntireInvoiceErrors.CityRequired());
  }
  if (!payerAddress.countryCode) {
    return left(new MigrateEntireInvoiceErrors.CountryCodeRequired());
  }
  if (!payerAddress.postalCode) {
    return left(new MigrateEntireInvoiceErrors.PostalCodeRequired());
  }
  if (payerAddress.countryCode === 'US' && !payerAddress.state) {
    return left(
      new MigrateEntireInvoiceErrors.StateIsRequiredForUnitedStates()
    );
  }

  return right(payerAddress);
}
