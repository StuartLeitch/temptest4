import { MockPublisherRepo } from '../../repos/mocks/mockPublisherRepo';
import { PublisherMap, RawPublisher } from '../../mappers/PublisherMap';

import { GetPublisherDetailsErrors } from './getPublisherDetailsErrors';
import { GetPublisherDetailsUsecase } from './getPublisherDetails';
import { GetPublisherDetailsDTO } from './getPublisherDetailsDTO';

describe('GetPublisherDetailsUsecase', () => {
  let usecase: GetPublisherDetailsUsecase;
  let publisherRepo: MockPublisherRepo;

  beforeEach(() => {
    publisherRepo = new MockPublisherRepo();
    usecase = new GetPublisherDetailsUsecase(publisherRepo);
    addPublishers(publisherRepo);
  });

  it('should get the correct publisher by id', async () => {
    const request: GetPublisherDetailsDTO = {
      publisherId: '1'
    };

    const maybeResult = await usecase.execute(request);

    if (maybeResult.isLeft()) {
      fail(maybeResult.value.errorValue());
    }
    const value = maybeResult.value.getValue();
    expect(value.id.toString()).toBe('1');
    expect(value.name).toBe('Hindawi');
  });

  it('should get error if id does not exist', async () => {
    const request: GetPublisherDetailsDTO = {
      publisherId: '3'
    };

    const maybeResult = await usecase.execute(request);

    if (maybeResult.isRight()) {
      fail(
        `There exists a value for id {${request.publisherId}}: ${JSON.stringify(
          maybeResult.value.getValue(),
          null,
          2
        )}`
      );
    }
    const error = maybeResult.value;
    expect(error).toBeInstanceOf(
      GetPublisherDetailsErrors.PublisherNotFoundError
    );
  });
});

function addPublishers(publisherRepo: MockPublisherRepo) {
  const publisherProps: RawPublisher[] = [
    {
      customValues: {
        journalItemReference: '',
        tradeDocumentItem: '',
        journalReference: '',
        journalItemTag: '',
        journalTag: ''
      },
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      name: 'Hindawi',
      id: '1'
    },
    {
      customValues: {
        journalItemReference: '',
        tradeDocumentItem: '',
        journalReference: '',
        journalItemTag: '',
        journalTag: ''
      },
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      name: 'Wiley',
      id: '2'
    }
  ];

  for (const props of publisherProps) {
    const publisher = PublisherMap.toDomain(props);
    publisherRepo.addMockItem(publisher);
  }
}
