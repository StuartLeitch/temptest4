import { expect, assert } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { Result } from '../../../../../src/lib/core/logic/Result';
import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { Invoice, InvoiceStatus } from '../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceNumber } from '../../../../../src/lib/modules/invoices/domain/InvoiceNumber';
import { InvoiceMap } from '../../../../../src/lib/modules/invoices/mappers/InvoiceMap';

let invoice: Invoice;
let invoiceId: string;
let invoiceNumber = null;
let invoiceStatus = null;
let currentYear = (new Date()).getFullYear();
let creationDate = null;
let acceptanceDate = null;
let confirmationDate = null;

Before(function () {
  invoiceId = 'test-invoice';
  invoice = InvoiceMap.toDomain({
    id: invoiceId,
    // status: InvoiceStatus.DRAFT,
  });
});

Given(/^Invoice number is ([^\"]*)$/,
  function (setInvoiceNumber: string) {
    invoiceNumber = Number.parseInt(setInvoiceNumber, 10) ?? null;
    invoice.invoiceNumber = invoiceNumber;
  }
);

Given(/^The date of manuscript acceptance is ([^\"]*)$/, function (
  setAcceptanceDate: string
) {
  invoice.dateAccepted = new Date(setAcceptanceDate);
});

Given(/^The date of confirmation is ([^\"]*)$/, function (
  setConfirmationDate: string
) {
  invoice.dateIssued = setConfirmationDate ? new Date(setConfirmationDate) : null;
});

When(/^The Invoice changes status to ([\w-]+)$/, function(setInvoiceStatus: string) {

  invoiceStatus = String(setInvoiceStatus);
  invoice.status = invoiceStatus;
})

Then(/^Stored reference number should be ([^\"]*)$/, function (
  testPersistentReferenceNumber: string
) {
  // const padded = invoice.applyPadding(acceptanceDate);
  if (testPersistentReferenceNumber === null) {
    // * reference number is null
    expect(String(invoice.persistentReferenceNumber)).to.equal('null');
  } else {
    assert.strictEqual(invoice.persistentReferenceNumber, testPersistentReferenceNumber);
  }
});
