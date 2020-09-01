import { expect } from 'chai';
import { Given, When, Then, Before, After } from 'cucumber';

import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../domain/authorization';
import { EditorCollection } from '../../../domain/Editor';
import { EditorMap } from '../../../mappers/EditorMap';
import { CatalogMap } from './../../../mappers/CatalogMap';
import { JournalId } from '../../../domain/JournalId';
import { EditorId } from '../../../domain/EditorId';
import { MockEditorRepo } from '../../../repos/mocks/mockEditorRepo';
import { MockCatalogRepo } from '../../../repos/mocks/mockCatalogRepo';
import { RemoveEditorsFromJournalUsecase } from './removeEditorsFromJournal';

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

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

let mockEditorRepo: MockEditorRepo;
let mockCatalogRepo: MockCatalogRepo;
let usecase: RemoveEditorsFromJournalUsecase;
let journalEditorsIds: string[] = [];
let journalCount = 0;

Before(function () {
  mockEditorRepo = new MockEditorRepo();
  mockCatalogRepo = new MockCatalogRepo();
  usecase = new RemoveEditorsFromJournalUsecase(
    mockEditorRepo,
    mockCatalogRepo
  );
});

After(function () {
  journalEditorsIds = [];
  mockEditorRepo.clear();
  mockCatalogRepo.clear();
});

Given(
  'There is a total of {int} editors in the system',
  async (start: number) => {
    [...new Array(Number(start))].map(async (curr: any, idx: number) => {
      const editor = await mockEditorRepo.save(
        EditorMap.toDomain({
          editorId: `${idx}-editor`,
          journalId: `${idx}-journal`,
          name: `${idx}-editor-name`,
          email: `email${idx}@editor.com`,
          roleType: `${idx}-role-type`,
          roleLabel: `${idx}-role-label`,
        })
      );
      journalEditorsIds.push(editor.id.toString());
    });
  }
);

Given(
  /^There is a Journal having id "([\w-]+)" with (\d+) editors$/,
  async function (journalId: string, journalStartEditors: number) {
    await mockCatalogRepo.save(
      CatalogMap.toDomain({
        journalId,
        type: 'mock',
        amount: 666,
      })
    );

    journalCount = +journalStartEditors;

    for (let idx = 0; idx < journalCount; idx++) {
      const editorId = EditorId.create(
        new UniqueEntityID(journalEditorsIds[idx])
      ).getValue();
      const editor = await mockEditorRepo.getEditorById(editorId);
      await mockEditorRepo.delete(editor);
    }

    journalEditorsIds = [];

    await Promise.all(
      [...new Array(journalCount)].map(async (curr: any, idx: number) => {
        const editor = await mockEditorRepo.save(
          EditorMap.toDomain({
            editorId: `${journalId}-${idx}-editor`,
            journalId: `${journalId}`,
            name: `${idx}-editor-name`,
            email: `email${idx}@editor.com`,
            roleType: `${idx}-role-type`,
            roleLabel: `${idx}-role-label`,
          })
        );
        journalEditorsIds.push(editor.id.toString());
      })
    );
  }
);

When(
  /^I delete (\d+) editors from Journal "([\w-]+)"$/,
  async (remove: number, journalId: string) => {
    const randomEditorsIds = getRandom(journalEditorsIds, +remove);
    const randomEditors = await Promise.all(
      randomEditorsIds.map(
        async (editorId: string) =>
          await mockEditorRepo.getEditorById(
            EditorId.create(new UniqueEntityID(editorId)).getValue()
          )
      )
    );

    await usecase.execute(
      {
        journalId,
        allEditors: randomEditors.map((re) => EditorMap.toPersistence(re)),
      },
      defaultContext
    );
  }
);

Then(
  /^I should have (\d+) editors in Journal "([\w-]+)"$/,
  async (journalLeft: number, journalId: string) => {
    const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorsByJournalId(
      JournalId.create(new UniqueEntityID(journalId)).getValue()
    );

    expect(editorCollectionAfter.length).to.equal(+journalLeft);
  }
);

Then('I should have {int} editors in the system', async (left: number) => {
  const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();

  expect(editorCollectionAfter.length).to.equal(left);
});
