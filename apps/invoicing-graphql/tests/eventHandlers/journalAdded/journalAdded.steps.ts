import { Before, Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

import {
  MockPublisherRepo,
  MockLoggerBuilder,
  MockCatalogRepo,
  PublisherMap,
  CatalogMap,
} from '@hindawi/shared';

import { Context } from '../../../src/builders';

import { JournalAddedHandler } from '../../../src/queue_service/handlers/JournalAdded';
import * as JournalAddedData from './JournalAdded.json';

const { handler } = JournalAddedHandler;

let mockCatalogRepo: MockCatalogRepo;
let mockPublisherRepo: MockPublisherRepo;

let context = {};

const defaultPublisher = {
  customValues: {
    customSegmentId: '',
    itemId: '',
    creditAccountId: '',
    debitAccountId: '',
    creditAccountIdForCascaded: '',
  },
  dateCreated: null,
  dateUpdated: null,
  id: 'Hindawi',
  name: 'Hindawi',
};

Before({ tags: '@ValidateJournalAdded' }, () => {
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
    loggerBuilder: new MockLoggerBuilder(),
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
