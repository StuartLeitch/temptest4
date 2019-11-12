import {MockEditorRepo} from '../../../repos/mocks/mockEditorRepo';
import {EditorCollection} from '../../../domain/Editor';

// * Usecases imports
import {
  Roles,
  CreateEditorAuthorizationContext
} from './createEditorAuthorizationContext';
import {CreateEditor} from './createEditor';
import {CreateEditorResponse} from './createEditorResponse';

const defaultContext: CreateEditorAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN]
};

let usecase: CreateEditor;
let mockEditorRepo: MockEditorRepo;
let result: CreateEditorResponse;

describe('Create Editor UseCase', () => {
  beforeEach(() => {
    mockEditorRepo = new MockEditorRepo();

    usecase = new CreateEditor(mockEditorRepo);
  });

  it('should create a new editor entry', async () => {
    const editorCollectionBefore: EditorCollection = await mockEditorRepo.getEditorCollection();
    expect(editorCollectionBefore.length).toEqual(0);

    result = await usecase.execute(
      {
        journalId: 'foo-journal',
        name: 'foo-editor-name',
        email: 'foo@editor.com',
        roleType: 'foo-role-type',
        roleLabel: 'foo-role-label'
      },
      defaultContext
    );
    expect(result.value.isSuccess).toBe(true);

    const editorCollectionAfter: EditorCollection = await mockEditorRepo.getEditorCollection();
    expect(editorCollectionAfter.length).toEqual(1);
  });
});
