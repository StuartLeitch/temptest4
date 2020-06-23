/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { Editor } from '@hindawi/phenom-events/src/lib/editor';
// import { MemberStatuses } from '@hindawi/phenom-events/src/lib/memberStatuses';
import { defineFeature, loadFeature } from 'jest-cucumber';

import { EditorCollection } from '../../../../../libs/shared/src/lib/modules/journals/domain/Editor';
import { EditorMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/EditorMap';
import { CatalogMap } from '../../../../../libs/shared/src/lib/modules/journals/mappers/CatalogMap';
import { MockLogger } from '../../../../../libs/shared/src/lib/infrastructure/logging/mocks/MockLogger';
import { MockEditorRepo } from '../../../../../libs/shared/src/lib/modules/journals/repos/mocks/mockEditorRepo';
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
  let mockEditorRepo: MockEditorRepo;
  let mockCatalogRepo: MockCatalogRepo;

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
    // given('a background step', () => {
    //   console.info()
    // });

    given(
      /^There are "(\d+)" editors in the Journal "([\w-]+)"$/,
      async (editorsLength: number, testJournalId: string) => {
        journalId = testJournalId;

        await mockCatalogRepo.save(
          CatalogMap.toDomain({
            journalId,
            // journalId: JournalEditorRemovedData.id,
            type: 'mock',
            amount: 666,
          })
        );

        [...new Array(+editorsLength)].map(async (curr: any, idx: number) => {
          const rawEditor: Editor = {
            id: `${testJournalId}-${idx}-editor`,
            orcidId: '',
            userId: '',
            givenNames: `${idx}-editor-name`,
            surname: `${idx}-editor-surname`,
            email: `email${idx}@editor.com`,
            status: 'pending' as any,
            role: {
              type: `${idx}-role-type`,
              label: `${idx}-role-label`,
            },
            invitedDate: '',
            declinedDate: '',
            acceptedDate: '',
            expiredDate: '',
            assignedDate: '',
            removedDate: '',
          };

          const editor = EditorMap.toDomain({
            ...rawEditor,
            journalId,
            name: `${rawEditor.givenNames} ${rawEditor.surname}`,
            roleType: rawEditor.role?.type,
            roleLabel: rawEditor.role?.label,
          });

          // console.info(editor)
          await mockEditorRepo.save(editor);
          journalEditors.push(editor);
        });
      }
    );

    and(
      /^All editors list from event data contains "(\d+)" entries only$/,
      async (eventEditorsLength: number) => {
        const eventEditors = getRandom(journalEditors, +eventEditorsLength);
        eventData = {
          editors: eventEditors.map(EditorMap.toPersistence),
        };
      }
    );

    and(
      /^The journal id from event data is "([\w-]+)"$/,
      async (eventJournalId: string) => {
        eventData.id = eventJournalId;
      }
    );

    when('JournalEditorRemoved event is being published', async () => {
      try {
        // await handler.call(context, eventData);
        await handler.call(context, JournalEditorRemovedData);
      } catch (err) {
        console.error(err);
      }
    });

    then(
      /^The journal "([\w-]+)" should have only "(\d+)" editors left$/,
      async (eventJournalId: string, expectedEditorsLeft: number) => {
        const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();
        expect(editorCollectionAfter.length).toBe(+expectedEditorsLeft);
      }
    );
  });
});
