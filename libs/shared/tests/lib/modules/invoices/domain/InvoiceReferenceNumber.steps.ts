import { Before, Given, When, Then } from '@cucumber/cucumber';
import { expect, assert } from 'chai';

import { InvoiceMap } from '../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import { Invoice } from '../../../../../src/lib/modules/invoices/domain/Invoice';

let invoice: Invoice;
let invoiceId: string;
let invoiceNumber = null;
let invoiceStatus = null;

Before({ tags: '@ValidateInvoiceReferenceNumber' }, function () {
  invoiceId = 'test-invoice';

  const maybeInvoice = InvoiceMap.toDomain({
    id: invoiceId,
  });

  if (maybeInvoice.isLeft()) {
    throw maybeInvoice.value;
  }

  invoice = maybeInvoice.value;
});

Given(/^Invoice number is ([^\"]*)$/, function (setInvoiceNumber: string) {
  invoiceNumber = Number.parseInt(setInvoiceNumber, 10) ?? null;
  invoice.invoiceNumber = invoiceNumber;
});

Given(/^The date of manuscript acceptance is ([^\"]*)$/, function (setAcceptanceDate: string) {
  invoice.dateAccepted = new Date(setAcceptanceDate);
});

Given(/^The date of confirmation is ([^\"]*)$/, function (setConfirmationDate: string) {
  invoice.dateIssued = setConfirmationDate ? new Date(setConfirmationDate) : null;
});

When(/^The Invoice changes status to ([\w-]+)$/, function (setInvoiceStatus: string) {
  invoiceStatus = String(setInvoiceStatus);
  invoice.status = invoiceStatus;
});

Then(/^Stored reference number should be ([^\"]*)$/, function (testPersistentReferenceNumber: string) {
  if (testPersistentReferenceNumber === null || testPersistentReferenceNumber === '') {
    // * reference number is null
    expect(String(invoice.persistentReferenceNumber)).to.equal('null');
  } else {
    assert.strictEqual(invoice.persistentReferenceNumber, testPersistentReferenceNumber);
  }
});
