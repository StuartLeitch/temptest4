import { Before, After, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'chai';

import { UniqueEntityID } from '../../../../../src/lib/core/domain/UniqueEntityID';

import { InvoiceItemId } from '../../../../../src/lib/modules/invoices/domain/InvoiceItemId';
import { InvoiceId } from '../../../../../src/lib/modules/invoices/domain/InvoiceId';
import {
  WaiverType,
  Waiver,
} from '../../../../../src/lib/modules/waivers/domain/Waiver';

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
let waiversToApply: Waiver[] = null;

let serviceResponse: Waiver = null;

const invoiceItemId = Object.freeze(
  InvoiceItemId.create(new UniqueEntityID('testInvoiceItem'))
);
const invoiceId = Object.freeze(
  InvoiceId.create(new UniqueEntityID('testInvoice')).getValue()
);
const manuscriptId = Object.freeze('testManuscript');

Before({ tags: '@ValidateWaiverService' }, () => {
  invoiceItemRepo = new MockInvoiceItemRepo();
  editorRepo = new MockEditorRepo();
  waiverRepo = new MockWaiverRepo();

  waiverService = new WaiverService(invoiceItemRepo, editorRepo, waiverRepo);

  const invoiceItem = InvoiceItemMap.toDomain({
    manuscriptId,
    invoiceId: invoiceId.toString(),
    id: invoiceItemId.toString(),
    dateCreated: new Date(),
    type: 'APC',
    price: 500,
    vat: 20,
  });

  invoiceItemRepo.addMockItem(invoiceItem);

  waiversToApply = [];
  serviceDTO = {
    invoiceId: invoiceId.toString(),
    allAuthorsEmails: [],
    journalId: null,
    country: null,
  };
});

After({ tags: '@ValidateWaiverService' }, () => {
  invoiceItemRepo = null;
  editorRepo = null;
  waiverRepo = null;

  waiverService = null;

  waiversToApply = null;
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

Given(
  /^A submitting author is from country with code "(\w+)"$/,
  (countryCode: string) => {
    serviceDTO.country = countryCode;
  }
);

When(
  /^Waivers are applied for manuscript on journal "([\w\d-]+)"$/,
  async (journalId: string) => {
    serviceDTO.journalId = journalId;

    serviceResponse = await waiverService.applyWaiver(serviceDTO);
  }
);

Then(
  /^The applied waiver is of type "([\w_]+)" with reduction "(\d+)"$/,
  async (waiverType: string, reduction: string) => {
    expect(serviceResponse).to.exist;
    expect(serviceResponse.waiverType.toString()).to.equal(waiverType);
    expect(serviceResponse.reduction).to.equal(Number.parseFloat(reduction));

    const appliedWaivers = await waiverRepo.getWaiversByInvoiceItemId(
      invoiceItemId as InvoiceItemId
    );

    expect(appliedWaivers.length).to.equal(1);
    expect(appliedWaivers.getItems()[0].waiver.waiverType).to.equal(waiverType);
    expect(appliedWaivers.getItems()[0].waiver.reduction).to.equal(
      Number.parseFloat(reduction)
    );
  }
);

Given(
  /^An editor with email "([\w\d_.@]+)" is on journal "([\w\d-]+)" with role "(\w+)"$/,
  (email: string, journalId: string, roleType: string) => {
    const editor = EditorMap.toDomain({
      journalId,
      roleType,
      email,
      roleLabel: 'roleLabel',
      name: 'testEditor',
    });

    editorRepo.addMockItem(editor);
  }
);

Given(
  /^Manuscript has authors with emails "([\w\d_, .@]+)"$/,
  (emails: string) => {
    serviceDTO.allAuthorsEmails = emails.split(', ');
  }
);

Given(/^Waiver of type "([\w_]+)" should apply$/, async (type: string) => {
  const waiver = await waiverRepo.getWaiverByType(WaiverType[type]);

  waiversToApply.push(waiver);
});

When(/^applyHighestReductionWaiver is called$/, async () => {
  serviceResponse = await waiverService.applyHighestReductionWaiver(
    invoiceId as InvoiceId,
    waiversToApply
  );
});
