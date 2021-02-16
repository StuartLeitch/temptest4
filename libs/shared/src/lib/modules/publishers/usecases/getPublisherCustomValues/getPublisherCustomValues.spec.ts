import { MockPublisherRepo } from '../../repos/mocks/mockPublisherRepo';
import { PublisherMap, RawPublisher } from '../../mappers/PublisherMap';

import { GetPublisherCustomValuesErrors } from './getPublisherCustomValuesErrors';
import { GetPublisherCustomValuesUsecase } from './getPublisherCustomValues';
import { GetPublisherCustomValuesDTO } from './getPublisherCustomValuesDTO';

describe('GetPublisherCustomValuesUsecase', () => {
  let usecase: GetPublisherCustomValuesUsecase;
  let publisherRepo: MockPublisherRepo;

  beforeEach(() => {
    publisherRepo = new MockPublisherRepo();
    usecase = new GetPublisherCustomValuesUsecase(publisherRepo);
    addPublishers(publisherRepo);
  });

  it('should get the correct publisher custom values by id', async () => {
    const request: GetPublisherCustomValuesDTO = {
      publisherId: '1',
    };

    const maybeResult = await usecase.execute(request);

    if (maybeResult.isLeft()) {
      fail(maybeResult.value.errorValue());
    }
    const value = maybeResult.value.getValue();
    expect(value.customSegmentId).toBe('Hindawi');
  });

  it('should get error if id does not exist', async () => {
    const request: GetPublisherCustomValuesDTO = {
      publisherId: '3',
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
      GetPublisherCustomValuesErrors.PublisherNotFount
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
