/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { CatalogMap, MockLogger, MockCatalogRepo } from '@hindawi/shared';
import { MockPublisherRepo } from '../../../../../libs/shared/src/lib/modules/publishers/repos/mocks/mockPublisherRepo';
import { PublisherMap } from '../../../../../libs/shared/src/lib/modules/publishers/mappers/PublisherMap';

import { Context } from '../../../src/builders';

import { JournalAddedHandler } from '../../../src/queue_service/handlers/JournalAdded';
import * as JournalAddedData from './JournalAdded.json';

const { handler } = JournalAddedHandler;

let mockLogger: MockLogger;
let mockCatalogRepo: MockCatalogRepo;
let mockPublisherRepo: MockPublisherRepo;

let context = {};

const defaultPublisher = {
  customValues: {
    customSegmentId: '',
    itemId: '',
    creditAccountId: '',
    debitAccountId: '',
  },
  dateCreated: null,
  dateUpdated: null,
  id: 'Hindawi',
  name: 'Hindawi',
};

Before({ tags: '@ValidateJournalAdded' }, () => {
  mockLogger = new MockLogger();
  mockCatalogRepo = new MockCatalogRepo();
  mockPublisherRepo = new MockPublisherRepo();

  const publisher = PublisherMap.toDomain(defaultPublisher);

  if (publisher.isLeft()) {
    throw publisher.value;
  }

  mockPublisherRepo.addMockItem(publisher.value);

  context = {
    repos: {
      catalog: mockCatalogRepo,
      publisher: mockPublisherRepo,
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
    publisherId: 'Hindawi',
  });

  if (testJournal.isLeft()) {
    throw testJournal.value;
  }

  await mockCatalogRepo.save(testJournal.value);
});

When('JournalAdded event is being published', async () => {
  try {
    await handler(context as Context)(JournalAddedData);
  } catch (err) {
    console.error(err);
  }
});

Then(/^The journal repo should have 1 entry$/, async () => {
  expect(true).equals(true);
});
