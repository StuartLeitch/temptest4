import { MockPublisherRepo } from '../../repos/mocks/mockPublisherRepo';
import { PublisherMap, RawPublisher } from '../../mappers/PublisherMap';

import { GetPublisherCustomValuesByNameErrors } from './getPublisherCustomValuesByNameErrors';
import { GetPublisherCustomValuesByNameUsecase } from './getPublisherCustomValuesByName';
import { GetPublisherCustomValuesByNameDTO } from './getPublisherCustomValuesByNameDTO';

describe('GetPublisherCustomValuesByNameUsecase', () => {
  let usecase: GetPublisherCustomValuesByNameUsecase;
  let publisherRepo: MockPublisherRepo;

  beforeEach(() => {
    publisherRepo = new MockPublisherRepo();
    usecase = new GetPublisherCustomValuesByNameUsecase(publisherRepo);
    addPublishers(publisherRepo);
  });

  it('should get the correct publisher custom values by name', async () => {
    const request: GetPublisherCustomValuesByNameDTO = {
      publisherName: 'Hindawi',
    };

    const maybeResult = await usecase.execute(request);

    if (maybeResult.isLeft()) {
      fail(maybeResult.value.errorValue());
    }
    const value = maybeResult.value.getValue();
    expect(value.customSegmentId).toBe('Hindawi');
  });

  it('should get error if name does not exist', async () => {
    const request: GetPublisherCustomValuesByNameDTO = {
      publisherName: '3',
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
      GetPublisherCustomValuesByNameErrors.PublisherNotFound
    );
  });
});

function addPublishers(publisherRepo: MockPublisherRepo) {
  const publisherProps: RawPublisher[] = [
    {
      customValues: {
        customSegmentId: 'Hindawi',
        itemId: 'Hindawi',
        creditAccountId: '10',
        debitAccountId: '11',
      },
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      name: 'Hindawi',
      id: '1',
    },
    {
      customValues: {
        customSegmentId: 'Wiley',
        itemId: 'Wiley',
        creditAccountId: '20',
        debitAccountId: '21',
      },
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      name: 'Wiley',
      id: '2',
    },
  ];

  for (const props of publisherProps) {
    const publisher = PublisherMap.toDomain(props);
    publisherRepo.addMockItem(publisher);
  }
}
