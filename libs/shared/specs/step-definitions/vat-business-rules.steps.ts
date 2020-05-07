import { InvoiceItemMap } from '../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { InvoiceItem } from '../../src/lib/modules/invoices/domain/InvoiceItem';
import { defineFeature, loadFeature } from 'jest-cucumber';
import {
  Invoice,
  InvoiceStatus
} from '../../src/lib/modules/invoices/domain/Invoice';

import { Payer, PayerType } from '../../src/lib/modules/payers/domain/Payer';
import { PayerMap } from '../../src/lib/modules/payers/mapper/Payer';
import { InvoiceMap } from '../../src/lib/modules/invoices/mappers/InvoiceMap';

import { PoliciesRegister } from '../../src/lib/modules/invoices/domain/policies/PoliciesRegister';
import { UKVATTreatmentArticleProcessingChargesPolicy } from '../../src/lib/modules/invoices/domain/policies/UKVATTreatmentArticleProcessingChargesPolicy';

const feature = loadFeature('../features/vat-business-rules.feature', {
  loadRelativePath: true,
});

defineFeature(feature, test => {
  let payer: Payer;
  let invoice: Invoice;
  let invoiceItem: InvoiceItem;
  let APCPolicy: UKVATTreatmentArticleProcessingChargesPolicy;
  let policiesRegister: PoliciesRegister;
  let calculateVAT: any;
  let VATNote: any;
  let invoiceId: string;
  let manuscriptId: string;
  let payerId: string;
  let receivedTotalAmount: number;

  function setPayerType(payerType: string) {
    const types = {
      individual: {
        VATRegistered: false,
        asBusiness: false
      },
      institution: {
        VATRegistered: true,
        asBusiness: true
      },
      nonVatInstitution: {
        VATRegistered: false,
        asBusiness: true
      }
    }
    if (!(payerType in types)) {
      console.error(`Invalid payer type [${payerType}]`);
      return;
    }
    return types[payerType];
  }

  beforeEach(() => {
    payerId = 'test-payer';
    invoiceId = 'test-invoice';
    manuscriptId = 'test-manuscript';
    payer = PayerMap.toDomain({
      id: payerId,
      invoiceId,
      name: 'foo',
      type: PayerType.INSTITUTION
    });

    invoice = InvoiceMap.toDomain({
      id: invoiceId,
      status: InvoiceStatus.DRAFT,
      payerId: payer.payerId.id.toString()
    });

    invoiceItem = InvoiceItemMap.toDomain({
      invoiceId,
      manuscriptId,
      price: 0,

    });
    policiesRegister = new PoliciesRegister();
  });

  const givenThePayerIsAnIn = (given) => {
    given(/^The Payer is an (\w+) in (\w+)$/, (payerType: string, country: string) => {
      APCPolicy = new UKVATTreatmentArticleProcessingChargesPolicy();
      policiesRegister.registerPolicy(APCPolicy);

      const countryCode = country;
      const { asBusiness, VATRegistered } = setPayerType(payerType);

      calculateVAT = policiesRegister.applyPolicy(APCPolicy.getType(), [
        { countryCode },
        asBusiness,
        VATRegistered
      ]);
    });
  };
  test('UK VAT rates calculation for an APC', ({ given, when, then }) => {
    givenThePayerIsAnIn(given)

    when(/^The payer will pay for an APC of (\d+)$/, async (invoiceNetValue: string) => {
      const vat = calculateVAT.getVAT();
      invoiceItem.vat = vat;

      invoiceItem.price = Number(invoiceNetValue);
      invoice.addInvoiceItem(invoiceItem);
      receivedTotalAmount = invoice.invoiceItems.getItems().reduce((total, eachInvoiceItem) => total + ((eachInvoiceItem.vat + 100) / 100 * eachInvoiceItem.price), 0);
    });

    then(/^The invoice total amount should be (\d+)$/, async (expectedTotalAmount: string) => {
      expect(receivedTotalAmount).toEqual(Number(expectedTotalAmount));
    });
  });

  test('UK VAT notes setup for an APC', ({ given, when, then }) => {
    givenThePayerIsAnIn(given)

    when('The VAT note is generated', () => {
      VATNote = calculateVAT.getVATNote();
    });

    then('The VAT note should have the following properties', expectedVATNoteProp => {
      const { NoteTemplate, TaxTreatmentValue, TaxTreatmentText, TaxTypeValue, TaxTypeText } = expectedVATNoteProp[0];
      expect(VATNote.template).toBe(NoteTemplate);
      expect(VATNote.tax.treatment.value).toBe(TaxTreatmentValue);
      expect(VATNote.tax.treatment.text).toBe(TaxTreatmentText);
      expect(VATNote.tax.type.value).toBe(TaxTypeValue);
      expect(VATNote.tax.type.text).toBe(TaxTypeText);
    });
  })
});
