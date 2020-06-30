/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { defineFeature, loadFeature } from 'jest-cucumber';

import { UniqueEntityID } from '../../../../../libs/shared/src/lib/core/domain/UniqueEntityID';
import { JournalId } from '../../../../../libs/shared/src/lib/modules/journals/domain/JournalId';
import { CatalogMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/CatalogMap';
import { MockLogger } from '../../../../../libs/shared/src/lib/infrastructure/logging/mocks/MockLogger';
import { MockCatalogRepo } from '../../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockCatalogRepo';

import { JournalAddedHandler } from '../../../src/queue_service/handlers/JournalAdded';
import * as JournalAddedData from './JournalAdded.json';

const { handler } = JournalAddedHandler;

const feature = loadFeature('./journalAdded.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let mockLogger: MockLogger;
  let mockCatalogRepo: MockCatalogRepo;

  let context = {};

  beforeEach(() => {
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

  test('Journal Added', ({ given, and, when, then }) => {
    given(/^There is no Journal registered$/, async (testJournalId: string) => {
      const testJournal = CatalogMap.toDomain({
        ...JournalAddedData,
        journalId: JournalAddedData.id,
        type: 'FOO',
        apc: 666,
      });
      await mockCatalogRepo.save(testJournal);
    });

    when('JournalAdded event is being published', async () => {
      try {
        await handler.call(context, JournalAddedData);
      } catch (err) {
        console.error(err);
      }
    });

    then(
      /^The journal repo should have 1 entry$/,
      async (eventJournalId: string, expectedFoo: string) => {
        const rawJournalId = JournalAddedData.id;
        const journalId = JournalId.create(new UniqueEntityID(rawJournalId));

        const journal = await mockCatalogRepo.getCatalogItemById(
          journalId.getValue().id
        );

        expect(journal.amount).toBe(JournalAddedData.apc);
      }
    );
  });
});
