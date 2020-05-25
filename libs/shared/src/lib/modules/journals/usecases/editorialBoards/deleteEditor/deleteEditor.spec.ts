import { MockEditorRepo } from '../../../repos/mocks/mockEditorRepo';
import { EditorCollection } from '../../../domain/Editor';
import { EditorMap } from '../../../mappers/EditorMap';

// * Usecases imports
import {
  Roles,
  DeleteEditorAuthorizationContext,
} from './deleteEditorAuthorizationContext';
import { DeleteEditor } from './deleteEditor';
import { DeleteEditorResponse } from './deleteEditorResponse';

const defaultContext: DeleteEditorAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

let usecase: DeleteEditor;
let mockEditorRepo: MockEditorRepo;
let result: DeleteEditorResponse;
let last = null;
const INITIAL = 12;

describe('Delete Editor UseCase', () => {
  beforeEach(async () => {
    mockEditorRepo = new MockEditorRepo();

    [...new Array(INITIAL)].map(async (curr: any, idx: number) => {
      last = EditorMap.toDomain({
        editorId: `${idx}-editor`,
        journalId: `${idx}-journal`,
        name: `${idx}-editor-name`,
        email: `email${idx}@editor.com`,
        roleType: `${idx}-role-type`,
        roleLabel: `${idx}-role-label`,
      });
      await mockEditorRepo.save(last);
    });

    usecase = new DeleteEditor(mockEditorRepo);
  });

  it('should delete the editor entry', async () => {
    const editorCollectionBefore: EditorCollection = await mockEditorRepo.getEditorCollection();
    expect(editorCollectionBefore.length).toEqual(INITIAL);

    result = await usecase.execute(
      EditorMap.toPersistence(last),
      defaultContext
    );

    expect(result.isRight()).toBe(true);

    const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();
    expect(editorCollectionAfter.length).toEqual(INITIAL - 1);
  });
});
