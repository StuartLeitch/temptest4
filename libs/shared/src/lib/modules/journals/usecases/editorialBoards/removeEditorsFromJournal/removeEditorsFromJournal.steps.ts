import { CatalogMap } from './../../../mappers/CatalogMap';
import { defineFeature, loadFeature } from 'jest-cucumber';

import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { EditorCollection } from '../../../domain/Editor';
import { EditorMap } from '../../../mappers/EditorMap';
import { JournalId } from '../../../domain/JournalId';
import { EditorId } from '../../../domain/EditorId';
import { MockEditorRepo } from '../../../repos/mocks/mockEditorRepo';
import { MockCatalogRepo } from '../../../repos/mocks/mockCatalogRepo';
import { RemoveEditorsFromJournalUsecase } from './removeEditorsFromJournal';

import {
  Roles,
  RemoveEditorsFromJournalAuthorizationContext,
} from './removeEditorsFromJournalAuthorizationContext';

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

const feature = loadFeature('./removeEditorsFromJournal.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  const defaultContext: RemoveEditorsFromJournalAuthorizationContext = {
    roles: [Roles.SUPER_ADMIN],
  };

  let mockEditorRepo: MockEditorRepo;
  let mockCatalogRepo: MockCatalogRepo;
  let usecase: RemoveEditorsFromJournalUsecase;
  let journalEditorsIds: string[] = [];
  let journalCount = 0;

  beforeEach(() => {
    mockEditorRepo = new MockEditorRepo();
    mockCatalogRepo = new MockCatalogRepo();
    usecase = new RemoveEditorsFromJournalUsecase(
      mockEditorRepo,
      mockCatalogRepo
    );
  });

  afterEach(() => {
    journalEditorsIds = [];
  });

  const givenAJournalWithEditors = (given, and) => {
    given(/^There is a Journal having id (\w+)$/, async (journalId: string) => {
      await mockCatalogRepo.save(
        CatalogMap.toDomain({
          journalId,
          type: 'mock',
          amount: 666,
        })
      );
    });

    and(
      /^There are (\d+) editors in the Journal (\w+)$/,
      async (journalStart: string, journalId: string) => {
        journalCount = +journalStart;
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
        });
      }
    );

    and(/^There are (\d+) editors in the system$/, async (start: string) => {
      [...new Array(Number(start) - journalCount)].map(
        async (curr: any, idx: number) => {
          await mockEditorRepo.save(
            EditorMap.toDomain({
              editorId: `${idx}-editor`,
              journalId: `${idx}-journal`,
              name: `${idx}-editor-name`,
              email: `email${idx}@editor.com`,
              roleType: `${idx}-role-type`,
              roleLabel: `${idx}-role-label`,
            })
          );
          // editorsIds.push(editor.id.toString());
        }
      );
    });
  };

  test('Remove Editors from Journal', ({ given, and, when, then }) => {
    givenAJournalWithEditors(given, and);

    when(
      /^I delete (\d+) editors from Journal (\w+)$/,
      async (remove: string, journalId: string) => {
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

    then(
      /^I should have (\d+) editors in Journal (\w+)$/,
      async (journalLeft: string, journalId: string) => {
        const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorsByJournalId(
          JournalId.create(new UniqueEntityID(journalId)).getValue()
        );
        expect(editorCollectionAfter.length).toEqual(+journalLeft);
      }
    );

    and(/^I should have (\d+) editors in the system$/, async (left: string) => {
      const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();
      expect(editorCollectionAfter.length).toEqual(+left);
    });
  });
});
