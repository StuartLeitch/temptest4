import { defineFeature, loadFeature } from 'jest-cucumber';

import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';

import { EditorCollection } from '../../../domain/Editor';
import { EditorMap } from '../../../mappers/EditorMap';
import { CatalogMap } from '../../../mappers/CatalogMap';
import { JournalId } from '../../../domain/JournalId';
// import { EditorId } from '../../../domain/EditorId';
import { MockEditorRepo } from '../../../repos/mocks/mockEditorRepo';
import { MockCatalogRepo } from '../../../repos/mocks/mockCatalogRepo';
import { GetEditorsByJournalUsecase } from './getEditorsByJournal';

import {
  Roles,
  GetEditorsByJournalAuthorizationContext,
} from './getEditorsByJournalAuthorizationContext';

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

const feature = loadFeature('./getEditorsByJournal.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  const defaultContext: GetEditorsByJournalAuthorizationContext = {
    roles: [Roles.SUPER_ADMIN],
  };

  let mockEditorRepo: MockEditorRepo;
  let mockCatalogRepo: MockCatalogRepo;
  let usecase: GetEditorsByJournalUsecase;
  let journalEditorsIds: string[] = [];

  beforeEach(() => {
    mockEditorRepo = new MockEditorRepo();
    mockCatalogRepo = new MockCatalogRepo();
    usecase = new GetEditorsByJournalUsecase(mockEditorRepo, mockCatalogRepo);
  });

  afterEach(() => {
    journalEditorsIds = [];
  });

  const givenAJournalWithEditors = (given, and) => {
    given(
      /^There is a Journal with id "([\w-]+)" and "(\d+)" editors$/,
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
  };

  test('Get Editors By Journal', ({ given, and, when, then }) => {
    givenAJournalWithEditors(given, and);

    when(
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

    then(
      /^I should receive "(\d+)" editors of Journal "([\w-]+)"$/,
      async (count: number, journalId: string) => {
        const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorsByJournalId(
          JournalId.create(new UniqueEntityID(journalId)).getValue()
        );
        expect(editorCollectionAfter.length).toEqual(+count);
      }
    );
  });
});
