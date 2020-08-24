import { expect } from 'chai';
import { Given, When, Then, Before, After } from 'cucumber';

import { UniqueEntityID } from '../../../../../core/domain/UniqueEntityID';
import { EditorCollection } from '../../../domain/Editor';
import { EditorMap } from '../../../mappers/EditorMap';
import { EditorId } from '../../../domain/EditorId';
import { MockEditorRepo } from '../../../repos/mocks/mockEditorRepo';
import { DeleteEditor } from './deleteEditor';

import {
  UsecaseAuthorizationContext,
  Roles,
} from '../../../../../../../src/lib/domain/authorization';

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
let usecase: DeleteEditor;
let editorsIds: string[] = [];

Before(function () {
  mockEditorRepo = new MockEditorRepo();
  usecase = new DeleteEditor(mockEditorRepo);
});

After(function () {
  editorsIds = [];
});

Given('There are {int} editors', async function (start: number) {
  [...new Array(start)].map(async (curr: any, idx: number) => {
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

When('I delete {int} editors', async function (remove: number) {
  const randomEditorIds = getRandom(editorsIds, remove);

  randomEditorIds.forEach(async (editorId: string) => {
    const randomEditor = await mockEditorRepo.getEditorById(
      EditorId.create(new UniqueEntityID(editorId)).getValue()
    );
    await usecase.execute(
      { editorId: randomEditor.editorId.id.toString() },
      defaultContext
    );
  });
});

Then('I should have {int} editors', async function (left: number) {
  const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();
  expect(editorCollectionAfter.length).to.equal(left);
});
