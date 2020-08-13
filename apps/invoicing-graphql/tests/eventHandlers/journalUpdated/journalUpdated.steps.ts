/* eslint-disable @nrwl/nx/enforce-module-boundaries */

// import { Editor } from '@hindawi/phenom-events/src/lib/editor';
// import { MemberStatuses } from '@hindawi/phenom-events/src/lib/memberStatuses';
import { defineFeature, loadFeature } from 'jest-cucumber';

import { UniqueEntityID } from '../../../../../libs/shared/src/lib/core/domain/UniqueEntityID';
import { JournalId } from '../../../../../libs/shared/src/lib/modules/journals/domain/JournalId';
// import { JournalCollection } from '../../../../../libs/shared/src/lib/modules/journals/domain/Journal';
// import { EditorMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/EditorMap';
import { CatalogMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/CatalogMap';
import { MockLogger } from '../../../../../libs/shared/src/lib/infrastructure/logging/mocks/MockLogger';
// import { MockEditorRepo } from '../../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { MockCatalogRepo } from '../../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockCatalogRepo';

import { JournalUpdatedHandler } from '../../../src/queue_service/handlers/JournalUpdated';
import * as JournalUpdatedData from './JournalUpdated.json';

// function getRandom(arr: string[], n: number) {
//   const result = new Array(n);
//   let len = arr.length;
//   const taken = new Array(len);

//   if (n > len) {
//     throw new RangeError('getRandom: more elements taken than available');
//   }

//   while (n--) {
//     const x = Math.floor(Math.random() * len);
//     result[n] = arr[x in taken ? taken[x] : x];
//     taken[x] = --len in taken ? taken[len] : len;
//   }

//   return result;
// }

const { handler } = JournalUpdatedHandler;

const feature = loadFeature('./journalUpdated.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let mockLogger: MockLogger;
  // let mockEditorRepo: MockEditorRepo;
  let mockCatalogRepo: MockCatalogRepo;

  let context = {};
  // let eventData = null;
  // let journalId = null;
  // let journalEditors = [];

  beforeEach(() => {
    mockLogger = new MockLogger();
    // mockEditorRepo = new MockEditorRepo();
    mockCatalogRepo = new MockCatalogRepo();

    context = {
      repos: {
        // editor: mockEditorRepo,
        catalog: mockCatalogRepo,
      },
      services: {
        logger: mockLogger,
      },
    };
  });

  afterEach(() => {
    // journalEditors = [];
  });

  test('Journal Updated', ({ given, and, when, then }) => {
    given(
      /^There is the Journal "([\w-]+)"$/,
      async (testJournalId: string) => {
        // const journalId = JournalUpdatedData.id;

        // console.info(JournalUpdatedData);
        const testJournal = CatalogMap.toDomain({
          ...JournalUpdatedData,
          journalId: JournalUpdatedData.id,
          type: 'FOO',
          apc: 666,
        });
        // console.info(testJournal);
        await mockCatalogRepo.save(testJournal);
      }
    );

    when('JournalUpdated event is being published', async () => {
      try {
        // await handler.call(context, eventData);
        await handler.call(context, JournalUpdatedData);
      } catch (err) {
        console.error(err);
      }
    });

    then(
      /^The journal "([\w-]+)" should be updated$/,
      async (eventJournalId: string, expectedFoo: string) => {
        // const rawJournalId = eventJournalId;
        const rawJournalId = JournalUpdatedData.id;
        const journalId = JournalId.create(new UniqueEntityID(rawJournalId));

        const journal = await mockCatalogRepo.getCatalogItemById(
          journalId.getValue().id
        );

        expect(journal.amount).toBe(JournalUpdatedData.apc);
      }
    );
  });
});
