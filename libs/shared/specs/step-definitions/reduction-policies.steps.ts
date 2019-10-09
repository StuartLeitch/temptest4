import {defineFeature, loadFeature} from 'jest-cucumber';

import {UniqueEntityID} from '../../lib/core/domain/UniqueEntityID';
import {
  Invoice,
  STATUS as InvoiceStatus
} from '../../lib/modules/invoices/domain/Invoice';

import {Payer} from '../../lib/modules/payers/domain/Payer';
import {PayerName} from '../../lib/modules/payers/domain/PayerName';
import {PayerType} from '../../lib/modules/payers/domain/PayerType';

import {PoliciesRegister} from '../../lib/domain/reductions/policies/PoliciesRegister';
import {WaivedCountryPolicy} from '../../lib/domain/reductions/policies/WaivedCountryPolicy';

const feature = loadFeature('./specs/features/reduction-policies.feature');

defineFeature(feature, test => {
  let invoice: Invoice;

  let waivedCountryPolicy: WaivedCountryPolicy;
  let policiesRegister: PoliciesRegister;

  let countryCode: string;
  let payerId: string;
  let invoiceId: string;
  let reductions: any;

  beforeEach(() => {
    payerId = 'test-payer';
    const payer = Payer.create(
      {
        name: PayerName.create('foo').getValue(),
        surname: PayerName.create('bar').getValue(),
        type: PayerType.create('individual').getValue()
      },
      new UniqueEntityID(payerId)
    ).getValue();

    invoiceId = 'test-invoice';
    invoice = Invoice.create(
      {
        status: InvoiceStatus.DRAFT,
        payerId: payer.payerId
      },
      new UniqueEntityID(invoiceId)
    ).getValue();

    policiesRegister = new PoliciesRegister();
  });

  afterEach(() => {
    // do nothing yet
  });

  test('WaiverCountry reduction', ({given, when, and, then}) => {
    given(/^The Author is in (\w+)$/, (country: string) => {
      countryCode = country;
      waivedCountryPolicy = new WaivedCountryPolicy();
      policiesRegister.registerPolicy(waivedCountryPolicy);
    });

    and('The Author purchases an APC', () => {});

    when(
      /^The invoice net value is (\d+)$/,
      async (invoiceNetValue: string) => {
        reductions = policiesRegister.applyPolicy(
          waivedCountryPolicy.getType(),
          [countryCode]
        );

        const reduction = reductions.getReduction();
        console.info(reduction.reductionPercentage);
      }
    );

    then(
      /^The invoice total amount is (\d+)$/,
      async (expectedTotalAmount: string) => {
        expect(invoice.getValue()).toEqual(parseInt(expectedTotalAmount, 10));
      }
    );
  });
});
