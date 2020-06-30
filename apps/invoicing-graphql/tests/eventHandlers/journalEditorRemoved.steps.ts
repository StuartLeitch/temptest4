/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { expect } from 'chai';
import { Given, When, Then, Before, After } from 'cucumber';

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

let mockLogger: MockLogger;
let mockEditorRepo: MockEditorRepo;
let mockCatalogRepo: MockCatalogRepo;

let context = {};
let eventData = null;
let journalId = null;
let journalEditors = [];

Before(function () {
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

After(function () {
  journalEditors = [];
});

Given(/^There are (\d+) editors in the Journal "([\w-]+)"$/, async function (
  editorsLength: number,
  testJournalId: string
) {
  journalId = testJournalId;

  await mockCatalogRepo.save(
    CatalogMap.toDomain({
      journalId,
      type: 'mock',
      amount: 666,
    })
  );

  await Promise.all(
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
    })
  );
});

Given(
  /^All editors list from event data contains (\d+) entries only$/,
  async (eventEditorsLength: number) => {
    const eventEditors = getRandom(journalEditors, +eventEditorsLength);
    eventData = {
      editors: eventEditors.map(EditorMap.toPersistence),
    };
  }
);

Given(
  /^The journal id from event data is "([\w-]+)"$/,
  async (eventJournalId: string) => {
    eventData.id = eventJournalId;
  }
);

When('"JournalEditorRemoved" event is being published', async function () {
  try {
    await handler.call(context, eventData);
  } catch (err) {
    console.error(err);
  }
});

Then(
  /^The journal "([\w-]+)" should have only (\d+) editors left$/,
  async (eventJournalId: string, expectedEditorsLeft: number) => {
    const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();
    expect(editorCollectionAfter.length).to.equal(+expectedEditorsLeft);
  }
);
