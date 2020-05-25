import { defineFeature, loadFeature } from 'jest-cucumber';

import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { EditorCollection } from '../../../domain/Editor';
import { EditorMap } from '../../../mappers/EditorMap';
import { EditorId } from '../../../domain/EditorId';
import { MockEditorRepo } from '../../../repos/mocks/mockEditorRepo';
import { DeleteEditor } from './deleteEditor';

import {
  Roles,
  DeleteEditorAuthorizationContext,
} from './deleteEditorAuthorizationContext';

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

const feature = loadFeature('./deleteEditor.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  const defaultContext: DeleteEditorAuthorizationContext = {
    roles: [Roles.SUPER_ADMIN],
  };

  let mockEditorRepo: MockEditorRepo;
  let usecase: DeleteEditor;
  let editorsIds: string[] = [];

  beforeEach(() => {
    mockEditorRepo = new MockEditorRepo();
    usecase = new DeleteEditor(mockEditorRepo);
  });

  afterEach(() => {
    editorsIds = [];
  });

  const givenAListOfEditors = (given) => {
    given(/^There are (\w+) editors$/, async (start: string) => {
      [...new Array(+start)].map(async (curr: any, idx: number) => {
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
        editorsIds.push(editor.id.toString());
      });
    });
  };

  test('Delete Editor(s)', ({ given, when, then }) => {
    givenAListOfEditors(given);
    when(/^I delete (\d+) editors$/, async (remove: string) => {
      const randomEditorIds = getRandom(editorsIds, +remove);
      // console.info(randomEditorIds);
      randomEditorIds.forEach(async (editorId: string) => {
        const randomEditor = await mockEditorRepo.getEditorById(
          EditorId.create(new UniqueEntityID(editorId)).getValue()
        );
        await usecase.execute(
          EditorMap.toPersistence(randomEditor),
          defaultContext
        );
      });
    });

    then(/^I should have (\d+) editors$/, async (left: string) => {
      const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();
      expect(editorCollectionAfter.length).toEqual(+left);
    });
  });
});
