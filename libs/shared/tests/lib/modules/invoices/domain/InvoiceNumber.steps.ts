import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { Result } from './../../../../../src/lib/core/logic/Result';
import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';
import { Invoice, InvoiceStatus } from './../../../../../src/lib/modules/invoices/domain/Invoice';
import { InvoiceNumber } from './../../../../../src/lib/modules/invoices/domain/InvoiceNumber';
import { InvoiceMap } from './../../../../../src/lib/modules/invoices/mappers/InvoiceMap';

let invoiceOrError: Result<Invoice>;
let invoice = null;
let invoiceNumber = null;
let lastInvoiceNumber = 1;
let currentYear = (new Date()).getFullYear();

Before(function () {
  invoiceOrError = null;
});

Given(/^The last generated invoice number for "([\w-]+)" is "([\w-]+)"$/,
  function (year: string, setInvoiceNumber: string) {
    currentYear = Number(year);
    lastInvoiceNumber = Number.parseInt(setInvoiceNumber, 10);
  }
);

When(
  /^I ask for an invoiceNumber for ID "([\w-]+)" on "([\d-]+)"$/,
  function (testInvoiceId: string, dateIssued: string) {
    const invoiceId = new UniqueEntityID(testInvoiceId);

    invoice = InvoiceMap.toDomain({
      id:invoiceId,
      status: InvoiceStatus.DRAFT,
      dateCreated: new Date(),
      deleted: 0,
    })

    invoiceNumber = InvoiceNumber.create({ value: lastInvoiceNumber }).getValue();
    invoice.assignInvoiceNumber(invoiceNumber.value);
  }
);

Then(/^The InvoiceNumber for ID "([\w-]+)" should be "([\d-]+)"$/, function (
  testInvoiceId: string,
  expectedInvoiceNumber: string
) {
  expect(invoice.invoiceNumber).to.equal(Number.parseInt(expectedInvoiceNumber, 10));
});
