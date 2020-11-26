import { expect } from 'chai';
import { Given, When, Then, BeforeAll, AfterAll } from '@cucumber/cucumber';

import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';

import {
  Roles,
  UsecaseAuthorizationContext,
} from '../../../../../domain/authorization';
import { EditorCollection } from '../../../domain/Editor';
import { EditorMap } from '../../../mappers/EditorMap';
import { CatalogMap } from '../../../mappers/CatalogMap';
import { JournalId } from '../../../domain/JournalId';
// import { EditorId } from '../../../domain/EditorId';
import { MockEditorRepo } from '../../../repos/mocks/mockEditorRepo';
import { MockCatalogRepo } from '../../../repos/mocks/mockCatalogRepo';
import { GetEditorsByJournalUsecase } from './getEditorsByJournal';

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
let usecase: GetEditorsByJournalUsecase;
let journalEditorsIds: string[] = [];

BeforeAll(function () {
  mockEditorRepo = new MockEditorRepo();
  mockCatalogRepo = new MockCatalogRepo();
  usecase = new GetEditorsByJournalUsecase(mockEditorRepo, mockCatalogRepo);
});

AfterAll(function () {
  journalEditorsIds = [];
});

Given(
  /^There is a Journal with id "([\w-]+)" and (\d+) editors$/,
  async (journalId: string, journalStart: number) => {
    await mockCatalogRepo.save(
      CatalogMap.toDomain({
        journalId,
        type: 'mock',
        amount: 666,
      })
    );

    [...new Array(+journalStart)].map(async (curr: any, idx: number) => {
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
    });
  }
);

When(
  /^I ask for the whole list of editors from Journal "([\w-]+)"$/,
  async (journalId: string) => {
    await usecase.execute(
      {
        journalId,
      },
      defaultContext
    );
  }
);

Then(
  /^I should receive (\d+) editors of Journal "([\w-]+)"$/,
  async (count: number, journalId: string) => {
    const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorsByJournalId(
      JournalId.create(new UniqueEntityID(journalId)).getValue()
    );
    expect(editorCollectionAfter.length).to.equal(count);
  }
);
