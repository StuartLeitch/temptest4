import { Before, After, Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

import { UsecaseAuthorizationContext } from '../../../../../../src/lib/domain/authorization';

import { InvoiceItem } from '../../../../../../src/lib/modules/invoices/domain/InvoiceItem';
import { Roles } from '../../../../../../src/lib/modules/users/domain/enums/Roles';
import {
  InvoiceStatus,
  Invoice,
} from '../../../../../../src/lib/modules/invoices/domain/Invoice';
import {
  PayerType,
  Payer,
} from '../../../../../../src/lib/modules/payers/domain/Payer';

import { InvoiceItemMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { InvoiceMap } from '../../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { PayerMap } from '../../../../../../src/lib/modules/payers/mapper/Payer';

import {
  ValidateVATResponse,
  ValidateVATUsecase,
} from '../../../../../../src/lib/modules/invoices/usecases/validateVAT';
import { VATService } from '../../../../../../src/lib/domain/services/VATService';

import { UKVATTreatmentArticleProcessingChargesPolicy } from '../../../../../../src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy';
import { PoliciesRegister } from '../../../../../../src/lib/modules/invoices/domain/policies/PoliciesRegister';
import { setupVatService } from '../../../../../../src/lib/domain/services/mocks/VatSoapClient';

const vatService: VATService = new VATService();

const validateVATUsecase = new ValidateVATUsecase(vatService);
const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.PAYER],
};
let payer: Payer;
let invoice: Invoice;
let invoiceItem: InvoiceItem;
let APCPolicy: UKVATTreatmentArticleProcessingChargesPolicy;
let policiesRegister: PoliciesRegister;
let calculateVAT: any;
let invoiceId: string;
let payerId: string;
let countryCode: string;
let vatResponse: ValidateVATResponse;
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

Before({ tags: '@ValidateVAT' }, () => {
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

After({ tags: '@LegacyValidateVAT or @ValidateVAT' }, () => {
  Date = oldDate;
});

Before({ tags: '@LegacyValidateVAT or @ValidateVAT' }, () => {
  payerId = 'test-payer';
  invoiceId = 'test-invoice';
  const maybePayer = PayerMap.toDomain({
    id: payerId,
    invoiceId,
    name: 'foo',
    type: PayerType.INSTITUTION,
  });

  if (maybePayer.isLeft()) {
    throw maybePayer.value;
  }

  payer = maybePayer.value;

  const maybeInvoice = InvoiceMap.toDomain({
    id: invoiceId,
    status: InvoiceStatus.DRAFT,
    payerId: payer.payerId.id.toString(),
  });

  if (maybeInvoice.isLeft()) {
    throw maybeInvoice.value;
  }

  invoice = maybeInvoice.value;

  const maybeInvoiceItem = InvoiceItemMap.toDomain({
    invoiceId,
    manuscriptId: 'test-manuscript',
  });

  if (maybeInvoiceItem.isLeft()) {
    throw maybeInvoiceItem.value;
  }

  invoiceItem = maybeInvoiceItem.value;

  policiesRegister = new PoliciesRegister();
  setupVatService();
});

Given(/^The Payer is in (\w+)$/, (country: string) => {
  countryCode = country;
});

When(
  /^The payer will pay for an APC of (\d+)$/,
  async (invoiceNetValue: string) => {
    const vat = calculateVAT.getVAT();
    invoiceItem.vat = vat;

    invoiceItem.price = Number(invoiceNetValue);
    invoice.addInvoiceItem(invoiceItem);
    receivedTotalAmount = invoice.invoiceItems
      .getItems()
      .reduce(
        (total, eachInvoiceItem) =>
          total + ((eachInvoiceItem.vat + 100) / 100) * eachInvoiceItem.price,
        0
      );
  }
);

Then(
  /^The invoice total amount should be (\d+)$/,
  async (expectedTotalAmount: string) => {
    expect(receivedTotalAmount).to.equal(Number(expectedTotalAmount));
  }
);

Given(
  /^The Payer is an (\w+) in (\w+)$/,
  (payerType: string, country: string) => {
    APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
    policiesRegister.registerPolicy(APCPolicy);

    countryCode = country;
    const { asBusiness, VATRegistered } = setPayerType(payerType);

    calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
      { countryCode },
      asBusiness,
      VATRegistered,
    ]);
  }
);

When('The VAT note is generated', () => {
  VATNote = calculateVAT.getVATNote();
});

Then(
  'The VAT note should have the following properties',
  (expectedVATNoteProp) => {
    expectedVATNoteProp = formatPropertiesArrayTable(
      expectedVATNoteProp.rawTable
    );
    const {
      NoteTemplate,
      TaxTreatmentValue,
      TaxTreatmentText,
      TaxTypeValue,
      TaxTypeText,
    } = expectedVATNoteProp;
    expect(VATNote.template).to.equal(NoteTemplate);
    expect(VATNote.tax.treatment.value).to.equal(TaxTreatmentValue);
    expect(VATNote.tax.treatment.text).to.equal(TaxTreatmentText);
    expect(VATNote.tax.type.value).to.equal(TaxTypeValue);
    expect(VATNote.tax.type.text).to.equal(TaxTypeText);
  }
);

When(/^The Payer VAT code (\d+) is checked$/, async (vatNumber: string) => {
  const result = await validateVATUsecase.execute(
    {
      countryCode,
      vatNumber: vatNumber,
    },
    defaultContext
  );
  vatResponse = result;
});

Then('The VAT code should be valid', async () => {
  if (
    vatResponse.isLeft() &&
    vatResponse.value.message === 'Service is currently unavailable'
  ) {
    expect(vatResponse.isRight()).to.equal(false);
  } else {
    if (vatResponse.isLeft()) {
      throw vatResponse.value;
    }
    expect(vatResponse.isRight()).to.equal(true);
    expect(vatResponse.value.valid).to.equal(true);
  }
});

Then('The VAT code should be invalid', async () => {
  if (vatResponse.isLeft()) {
    throw vatResponse.value;
  }
  expect(vatResponse.value.valid).to.equal(false);
});

Then('The VAT code-country should be invalid', async () => {
  expect(vatResponse.isRight()).to.equal(false);
});

Then(/^The VAT invalid message should be "(.*)"$/, (codeInvalid: string) => {
  expect(vatResponse.isRight()).to.equal(false);
  if (vatResponse.isLeft()) {
    expect(vatResponse.value.message).to.equal(codeInvalid);
  }
});
