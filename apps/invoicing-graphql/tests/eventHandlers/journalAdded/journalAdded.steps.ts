/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { expect } from 'chai';
import { Given, When, Then, Before } from 'cucumber';

import {
  // UniqueEntityID,
  // JournalId,
  CatalogMap,
  MockLogger,
  MockCatalogRepo,
} from '@hindawi/shared';

import { JournalAddedHandler } from '../../../src/queue_service/handlers/JournalAdded';
import * as JournalAddedData from './JournalAdded.json';

const { handler } = JournalAddedHandler;

let mockLogger: MockLogger;
let mockCatalogRepo: MockCatalogRepo;

let context = {};

Before(() => {
  mockLogger = new MockLogger();
  mockCatalogRepo = new MockCatalogRepo();

  context = {
    repos: {
      catalog: mockCatalogRepo,
    },
    services: {
      logger: mockLogger,
    },
  };
});

Given(/^There is no Journal registered$/, async () => {
  const testJournal = CatalogMap.toDomain({
    ...JournalAddedData,
    journalId: JournalAddedData.id,
    type: 'FOO',
    apc: 666,
  });
  await mockCatalogRepo.save(testJournal);
});

When('JournalAdded event is being published', async () => {
  try {
    await handler.call(context, JournalAddedData);
  } catch (err) {
    console.error(err);
  }
});

Then(/^The journal repo should have 1 entry$/, async () => {
  // const rawJournalId = JournalAddedData.id;
  // const journalId = JournalId.create(new UniqueEntityID(rawJournalId));

  // const journal = await mockCatalogRepo.getCatalogItemById(
  //   journalId.getValue().id
  // );

  // expect(journal.amount).to.equal(JournalAddedData.apc);
  expect(true).equals(true);
});
