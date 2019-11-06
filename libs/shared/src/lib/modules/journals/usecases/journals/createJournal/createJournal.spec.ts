import {MockJournalRepo} from '../../../repos/mocks/mockJournalRepo';
import {JournalCollection} from '../../../domain/Journal';

// * Usecases imports
import {
  Roles,
  CreateJournalAuthorizationContext
} from './createJournalAuthorizationContext';
import {CreateJournal} from './createJournal';
import {CreateJournalResponse} from './createJournalResponse';

const defaultContext: CreateJournalAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN]
};

let usecase: CreateJournal;
let mockJournalRepo: MockJournalRepo;
let result: CreateJournalResponse;
let journalCollection: JournalCollection;

describe('Create Journal UseCase', () => {
  beforeEach(() => {
    mockJournalRepo = new MockJournalRepo();

    usecase = new CreateJournal(mockJournalRepo);
  });

  afterEach(() => {
    mockJournalRepo.clear();
  });

  it('should create a new journal', async () => {
    journalCollection = await mockJournalRepo.getJournalCollection();
    expect(journalCollection.length).toEqual(0);

    result = await usecase.execute(
      {
        name: 'foo',
        email: 'foo@bar.com',
        issn: 'bar',
        code: 'baz',
        articleProcessingCharge: 1000,
        isActive: true
      },
      defaultContext
    );
    expect(result.value.isSuccess).toBe(true);

    journalCollection = await mockJournalRepo.getJournalCollection();
    expect(journalCollection.length).toEqual(1);
  });
});
