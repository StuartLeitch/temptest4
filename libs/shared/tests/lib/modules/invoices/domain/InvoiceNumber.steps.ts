import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';

import { InvoiceNumber } from './../../../../../src/lib/modules/invoices/domain/InvoiceNumber';
import { InvoiceMap } from './../../../../../src/lib/modules/invoices/mappers/InvoiceMap';
import {
  InvoiceStatus,
  Invoice,
} from './../../../../../src/lib/modules/invoices/domain/Invoice';

let invoiceNumber: InvoiceNumber = null;
let invoice: Invoice = null;
let lastInvoiceNumber = 1;

Given(
  /^The last generated invoice number is "([\w-]+)"$/,
  function (setInvoiceNumber: string) {
    lastInvoiceNumber = Number.parseInt(setInvoiceNumber, 10);
  }
);

When(
  /^I ask for an invoiceNumber for ID "([\w-]+)"$/,
  function (testInvoiceId: string) {
    const invoiceId = new UniqueEntityID(testInvoiceId);

    const maybeInvoice = InvoiceMap.toDomain({
      id: invoiceId,
      status: InvoiceStatus.DRAFT,
      dateCreated: new Date(),
      deleted: 0,
    });

    if (maybeInvoice.isLeft()) {
      throw maybeInvoice.value;
    }

    invoice = maybeInvoice.value;

    const maybeInvoiceNumber = InvoiceNumber.create({
      value: lastInvoiceNumber,
    });

    if (maybeInvoiceNumber.isLeft()) {
      throw maybeInvoiceNumber.value;
    }

    invoiceNumber = maybeInvoiceNumber.value;

    invoice.assignInvoiceNumber(invoiceNumber.value);
  }
);

Then(
  /^The InvoiceNumber for ID "([\w-]+)" should be "([\d-]+)"$/,
  function (testInvoiceId: string, expectedInvoiceNumber: string) {
    expect(invoice.invoiceNumber).to.equal(
      Number.parseInt(expectedInvoiceNumber, 10)
    );
  }
);
