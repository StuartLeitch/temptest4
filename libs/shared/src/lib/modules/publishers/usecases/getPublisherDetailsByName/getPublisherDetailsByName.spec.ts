import { MockPublisherRepo } from '../../repos/mocks/mockPublisherRepo';
import { PublisherMap, RawPublisher } from '../../mappers/PublisherMap';

import { GetPublisherDetailsByNameErrors } from './getPublisherDetailsByNameErrors';
import { GetPublisherDetailsByNameUsecase } from './getPublisherDetailsByName';
import { GetPublisherDetailsByNameDTO } from './getPublisherDetailsByNameDTO';

describe('GetPublisherDetailsByNameUsecase', () => {
  let usecase: GetPublisherDetailsByNameUsecase;
  let publisherRepo: MockPublisherRepo;

  beforeEach(() => {
    publisherRepo = new MockPublisherRepo();
    usecase = new GetPublisherDetailsByNameUsecase(publisherRepo);
    addPublishers(publisherRepo);
  });

  it('should get the correct publisher by id', async () => {
    const request: GetPublisherDetailsByNameDTO = {
      publisherName: 'Hindawi'
    };

    const maybeResult = await usecase.execute(request);

    if (maybeResult.isLeft()) {
      fail(maybeResult.value.errorValue());
    }
    const value = maybeResult.value.getValue();
    expect(value.id.toString()).toBe('1');
    expect(value.name).toBe('Hindawi');
  });

  it('should get error if name does not exist', async () => {
    const request: GetPublisherDetailsByNameDTO = {
      publisherName: '3'
    };

    const maybeResult = await usecase.execute(request);

    if (maybeResult.isRight()) {
      fail(
        `There exists a value for name {${
          request.publisherName
        }}: ${JSON.stringify(maybeResult.value.getValue(), null, 2)}`
      );
    }
    const error = maybeResult.value;
    expect(error).toBeInstanceOf(
      GetPublisherDetailsByNameErrors.PublisherNotFoundError
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
