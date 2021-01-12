import { Before, After, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'chai';

import { Waiver } from '../../../../../src/lib/modules/waivers/domain/Waiver';

import { InvoiceItemMap } from '../../../../../src/lib/modules/invoices/mappers/InvoiceItemMap';
import { EditorMap } from '../../../../../src/lib/modules/journals/mappers/EditorMap';
import { WaiverMap } from '../../../../../src/lib/modules/waivers/mappers/WaiverMap';

import { MockInvoiceItemRepo } from '../../../../../src/lib/modules/invoices/repos/mocks/mockInvoiceItemRepo';
import { MockEditorRepo } from '../../../../../src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { MockWaiverRepo } from '../../../../../src/lib/modules/waivers/repos/mocks/mockWaiverRepo';

import {
  WaiverServiceDTO,
  WaiverService,
} from '../../../../../src/lib/domain/services/WaiverService';

let invoiceItemRepo: MockInvoiceItemRepo = null;
let editorRepo: MockEditorRepo = null;
let waiverRepo: MockWaiverRepo = null;

let waiverService: WaiverService = null;

let serviceDTO: WaiverServiceDTO = null;

let serviceResponse: Waiver = null;

Before(() => {
  invoiceItemRepo = new MockInvoiceItemRepo();
  editorRepo = new MockEditorRepo();
  waiverRepo = new MockWaiverRepo();

  waiverService = new WaiverService(invoiceItemRepo, editorRepo, waiverRepo);

  const invoiceItem = InvoiceItemMap.toDomain({
    manuscriptId: 'testManuscript123',
    invoiceId: 'testInvoice123',
    dateCreated: new Date(),
    type: 'APC',
    price: 500,
    vat: 20,
  });

  invoiceItemRepo.addMockItem(invoiceItem);

  serviceDTO = {
    invoiceId: 'testInvoice123',
    journalId: 'testJournal123',
    allAuthorsEmails: [],
    country: null,
  };
});

After(() => {
  invoiceItemRepo = null;
  editorRepo = null;
  waiverRepo = null;

  waiverService = null;

  serviceDTO = null;
});

Given(
  /^There is a waiver for "([\w_]+)" of "(\d+)" percent reduction$/,
  (waiverType: string, reduction: string) => {
    const waiver = WaiverMap.toDomain({
      reduction: Number.parseFloat(reduction),
      type_id: waiverType,
      isActive: true,
    });

    waiverRepo.addMockItem(waiver);
  }
);

Given(/^A submitting author is from waived country$/, () => {
  serviceDTO.country = 'AO';
});

When(/^Waivers are applied$/, async () => {
  serviceResponse = await waiverService.applyWaiver(serviceDTO);
});

Then(
  /^The applied waiver is of type "([\w_]+)" with reduction "(\d+)"$/,
  (waiverType: string, reduction: string) => {
    expect(serviceResponse.waiverType.toString()).to.equal(waiverType);
    expect(serviceResponse.reduction).to.equal(Number.parseFloat(reduction));
  }
);
