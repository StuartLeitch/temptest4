/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { defineFeature, loadFeature } from 'jest-cucumber';

import { EditorCollection } from '../../../../libs/shared/src/lib/modules/journals/domain/Editor';
import { EditorMap } from '../../../../libs/shared/src/lib/modules/journals/mappers/EditorMap';
import { CatalogMap } from '../../../../libs/shared/src/lib/modules/journals/mappers/CatalogMap';
import { MockLogger } from '../../../../libs/shared/src/lib/infrastructure/logging/mocks/MockLogger';
import { MockEditorRepo } from './../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockEditorRepo';
import { MockCatalogRepo } from './../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockCatalogRepo';

import { JournalEditorRemovedHandler } from '../../src/queue_service/handlers/JournalEditorRemoved';

function getRandom(arr: string[], n: number) {
  const result = new Array(n);
  let len = arr.length;
  const taken = new Array(len);

  if (n > len) {
    throw new RangeError('getRandom: more elements taken than available');
  }

  while (n--) {
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }

  return result;
}

const { handler } = JournalEditorRemovedHandler;

const feature = loadFeature('./journalEditorRemoved.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let mockLogger: MockLogger;
  let mockEditorRepo: MockEditorRepo;
  let mockCatalogRepo: MockCatalogRepo;

  let eventHandler: (data: any) => void;
  let context = {};
  let eventData = null;
  let journalId = null;
  let journalEditors = [];

  beforeEach(() => {
    mockLogger = new MockLogger();
    mockEditorRepo = new MockEditorRepo();
    mockCatalogRepo = new MockCatalogRepo();

    context = {
      repos: {
        editor: mockEditorRepo,
        catalog: mockCatalogRepo,
      },
      services: {
        logger: mockLogger,
      },
    };
  });

  afterEach(() => {
    journalEditors = [];
  });

  test('Journal Editor Removed', ({ given, and, when, then }) => {
    given(
      /^There are (\d+) editors in the Journal ([\w-]+)$/,
      async (editorsLength: number, testJournalId: string) => {
        journalId = testJournalId;

        await mockCatalogRepo.save(
          CatalogMap.toDomain({
            journalId,
            type: 'mock',
            amount: 666,
          })
        );

        [...new Array(+editorsLength)].map(async (curr: any, idx: number) => {
          const rawEditor = {
            editorId: `${testJournalId}-${idx}-editor`,
            journalId: `${testJournalId}`,
            name: `${idx}-editor-name`,
            email: `email${idx}@editor.com`,
            roleType: `${idx}-role-type`,
            roleLabel: `${idx}-role-label`,
          };

          const editor = EditorMap.toDomain(rawEditor);
          await mockEditorRepo.save(editor);
          journalEditors.push(editor);
        });
      }
    );

    when('JournalEditorRemoved event is being published', async () => {
      // just wait for the right moment
    });

    and(
      /^The journal id from event data is ([\w-]+)$/,
      async (eventJournalId: string) => {
        eventData = { id: eventJournalId };
      }
    );

    and(
      /^All editors list from event data contains (\d+) entries only$/,
      async (eventEditorsLength: number) => {
        const eventEditors = getRandom(journalEditors, +eventEditorsLength);
        eventData.editors = eventEditors.map(EditorMap.toPersistence);

        // * All magic happens here!
        try {
          await handler.call(context, eventData);
        } catch (err) {
          console.error(err);
        }
      }
    );

    then(
      /^The journal ([\w-]+) should have only (\d+) editors left$/,
      async (eventJournalId: string, expectedEditorsLeft: number) => {
        const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();
        expect(editorCollectionAfter.length).toBe(+expectedEditorsLeft);
      }
    );
  });
});
