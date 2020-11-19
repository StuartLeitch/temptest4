/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

import { expect } from 'chai';
import { Given, When, Then, Before, After } from '@cucumber/cucumber';

import {
  EditorCollection,
  EditorMap,
  CatalogMap,
  MockLogger,
  MockEditorRepo,
  MockCatalogRepo,
} from '@hindawi/shared';

import { Context } from '../../../src/builders';

import { JournalEditorAssignedHandler } from '../../../src/queue_service/handlers/JournalEditorAssigned';

let mockLogger: MockLogger;
let mockEditorRepo: MockEditorRepo;
let mockCatalogRepo: MockCatalogRepo;

let context = {};
let eventData = null;
let journalId = null;
let journalEditors = [];

async function generateMockEditor(editorsLength: number) {
  await Promise.all(
    [...new Array(+editorsLength)].map(async (curr, idx: number) => {
      const rawEditor = {
        editorId: `${idx}-editor`,
        journalId: `${eventData.id}`,
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
  return journalEditors;
}

const { handler } = JournalEditorAssignedHandler;

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

Given(/^There is a Journal "([\w-]+)"$/, async function (
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
});

Given(
  /^The journal id from the JournalEditorAssigned event data is "([\w-]+)"$/,
  async (eventJournalId: string) => {
    eventData = {
      id: eventJournalId,
    };
  }
);

Given(
  /^All editors list from event data contains (\d+) entries$/,
  async (eventEditorsLength: number) => {
    const eventEditors = await generateMockEditor(eventEditorsLength);
    eventData.editors = eventEditors.map(EditorMap.toPersistence);
  }
);

When('"JournalEditorAssigned" event is being published', async function () {
  try {
    await handler(context as Context)(eventData);
  } catch (err) {
    console.error(err);
  }
});

Then(
  /^The journal "([\w-]+)" should have only (\d+) editors assigned$/,
  async (eventJournalId: string, expectedEditorsLeft: number) => {
    const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();
    expect(editorCollectionAfter.length).to.equal(+expectedEditorsLeft);
  }
);
