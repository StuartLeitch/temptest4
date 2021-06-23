import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

// import { ValidateVATErrors } from './../../../../../../src/lib/modules/invoices/usecases/validateVAT/validateVATErrors';
import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { InvoiceItem } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItem';
import { UsecaseAuthorizationContext } from '../../../../../../src/lib/domain/authorization';

import { ValidateVATUsecase } from '../../../../../../src/lib/modules/invoices/usecases/validateVAT/validateVAT';
import { VATService } from '../../../../../../src/lib/domain/services/VATService';
import { setupVatService } from '../../../../../../src/lib/domain/services/mocks/VatSoapClient';

import { Roles } from '../../../../../../src/lib/modules/users/domain/enums/Roles';
import {
  Invoice,
  InvoiceStatus,
} from '../../../../../../src/lib/modules/invoices/domain/Invoice';

import {
  Payer,
  PayerType,
} from '../../../../../../src/lib/modules/payers/domain/Payer';
import { PayerMap } from '../../../../../../src/lib/modules/payers/mapper/Payer';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';

import { PoliciesRegister } from '../../../../../../src/lib/modules/invoices/domain/policies/PoliciesRegister';
import { UKVATTreatmentArticleProcessingChargesPolicy } from '../../../../../../src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy';

const vatService: VATService = new VATService();

const validateVATUsecase = new ValidateVATUsecase(vatService);
const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};
let payer; //: Payer;
let invoice; //: Invoice;
let invoiceItem; //: InvoiceItem;
let APCPolicy: UKVATTreatmentArticleProcessingChargesPolicy;
let policiesRegister: PoliciesRegister;
let calculateVAT: any;
let invoiceId: string;
let payerId: string;
let countryCode: string;
let vatResponse: any;
let receivedTotalAmount: number;
let VATNote: any;

function setPayerType(payerType: string) {
  const types = {
    individual: {
      VATRegistered: false,
      asBusiness: false,
    },
    institution: {
      VATRegistered: true,
      asBusiness: true,
    },
    nonVatInstitution: {
      VATRegistered: false,
      asBusiness: true,
    },
  };
  if (!(payerType in types)) {
    console.error(`Invalid payer type [${payerType}]`);
    return;
  }
  return types[payerType];
}

function formatPropertiesArrayTable(propArray: any) {
  const result = {};
  for (let i = 0; i < propArray[0].length; i++) {
    result[propArray[0][i]] = propArray[1][i];
  }
  return result;
}

let oldDate = Date;

Before({ tags: '@LegacyValidateVAT' }, () => {
  const beforeBrexit = '2020-01-01T00:00:00.000Z';
  class NewDate extends Date {
    constructor(...options: any) {
      if (options.length) {
        // @ts-ignore
        super(...options);
      } else {
        super(beforeBrexit);
      }
    }
  }

  // @ts-ignore
  Date = NewDate;
});

Before({ tags: '@ValidateVATNote' }, () => {
  const afterBrexit = '2021-01-01T00:00:00.000Z';
  class NewDate extends Date {
    constructor(...options: any) {
      if (options.length) {
        // @ts-ignore
        super(...options);
      } else {
        super(afterBrexit);
      }
    }
  }

  // @ts-ignore
  Date = NewDate;
});

After({ tags: '@LegacyValidateVAT and @ValidateVATNote' }, () => {
  Date = oldDate;
});

Before(() => {
  payerId = 'test-payer';
  invoiceId = 'test-invoice';
  payer = PayerMap.toDomain({
    id: payerId,
    invoiceId,
    name: 'foo',
    type: PayerType.INSTITUTION,
  }).value;

  invoice = InvoiceMap.toDomain({
    id: invoiceId,
    status: InvoiceStatus.DRAFT,
    payerId: payer.payerId.id.toString(),
  }).value;

  invoiceItem = InvoiceItemMap.toDomain({
    invoiceId,
    manuscriptId: 'test-manuscript',
  }).value;
  policiesRegister = new PoliciesRegister();
  setupVatService();
});

Given(
  /^The Payer is from (\w+)$/,
  (country: string) => {
    APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
    policiesRegister.registerPolicy(APCPolicy);

    countryCode = country;
    //  //  const { asBusiness, VATRegistered } = setPayerType(payerType);

    calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
      { countryCode },
      false,
      false,
    ]);
  }
);

When('The VAT note is calculated', () => {
  VATNote = calculateVAT.getVATNote();
});

Then(
  /^The final VAT note should be (.*)$/,
  (expectedVATNote) => {

    if (typeof expectedVATNote === 'undefined') {
      expect(Boolean(VATNote.template)).to.equal(!!(expectedVATNote));
    } else {
      expect(VATNote.template).to.equal(expectedVATNote);
    }
  }
);
