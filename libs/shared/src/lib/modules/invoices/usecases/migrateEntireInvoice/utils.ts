import { Either, right, left } from '../../../../core/logic/Either';

import { PayerType } from '../../../payers/domain/Payer';

import {
  MigrateEntireInvoiceDTO,
  MigratePayerAddress,
  MigratePayer,
  MigrateAPC,
} from './migrateEntireInvoiceDTO';
import {
  AllMigrateEntireInvoiceErrors,
  PayerAddressErrors,
} from './migrateEntireInvoiceErrors';
import * as MigrateEntireInvoiceErrors from './migrateEntireInvoiceErrors';

type ValidateMainRequestReturn = Either<
  MigrateEntireInvoiceErrors.InvoiceIdRequired,
  MigrateEntireInvoiceDTO
>;

type ValidatePayerReturn = Either<
  | MigrateEntireInvoiceErrors.PayerNameRequired
  | MigrateEntireInvoiceErrors.PayerTypeRequired
  | MigrateEntireInvoiceErrors.IncorrectPayerType
  | PayerAddressErrors,
  MigratePayer
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

function validateMainRequestArguments(
  request: MigrateEntireInvoiceDTO
): ValidateMainRequestReturn {
  if (!request.invoiceId) {
    return left(new MigrateEntireInvoiceErrors.InvoiceIdRequired());
  }
  return right(request);
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

  return right(payerAddress);
}

function validatePayer(request: MigrateEntireInvoiceDTO): ValidatePayerReturn {
  const { payer } = request;
  if (!request.paymentDate || !request.issueDate) {
    return right(payer);
  }

  if (!payer && request.apc.discount === request.apc.price) {
    return right(payer);
  }

  if (!payer) {
    return left(new MigrateEntireInvoiceErrors.PayerNameRequired());
  }

  if (!payer?.name) {
    return left(new MigrateEntireInvoiceErrors.PayerNameRequired());
  }
  if (!payer?.type) {
    return left(new MigrateEntireInvoiceErrors.PayerTypeRequired());
  }
  if (!(payer.type in PayerType)) {
    return left(new MigrateEntireInvoiceErrors.IncorrectPayerType(payer.type));
  }

  return validatePayerAddress(payer.address).map(() => payer);
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

export async function validateRequest(
  request: MigrateEntireInvoiceDTO
): Promise<ValidateRequestReturn> {
  const result = validateMainRequestArguments(request)
    .chain(() => validatePayer(request))
    .chain(() => validateAPC(request.apc))
    .map(() => request);
  return result;
}
