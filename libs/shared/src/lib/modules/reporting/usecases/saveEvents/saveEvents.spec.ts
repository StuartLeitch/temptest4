import uuid from 'uuid/v4';
import { REPORTING_TABLES } from '../../constants';
import { EventDTO } from '../../domain/EventDTO';
import { EventMappingRegistry } from '../../EventMappingRegistry';
import { MockEventsRepo } from '../../repos/implementation/MockEventsRepo';
import { SaveEventsUsecase } from './saveEvents';
import {
  InvoiceMappingPolicy,
  SubmissionMappingPolicy,
  JournalMappingPolicy,
  UserMappingPolicy
} from '../../policies';

let mockRepo = new MockEventsRepo();
let mockEvents: EventDTO[] = [
  {
    data: { id: '', created: new Date() },
    id: uuid(),
    event: 'SubmissionSubmitted'
  },
  { data: {}, id: uuid(), event: 'JournalAdded' },
  { data: {}, id: uuid(), event: 'InvoicePaid' },
  { data: {}, id: uuid(), event: 'UserAdded' },
  { data: {}, id: uuid(), event: 'RandomDump' },
  { data: {}, id: uuid(), event: 'RandomDump2' }
];
const registry = new EventMappingRegistry();

registry.addPolicy(new InvoiceMappingPolicy());
registry.addPolicy(new SubmissionMappingPolicy());
registry.addPolicy(new JournalMappingPolicy());
registry.addPolicy(new UserMappingPolicy());

describe('saveEvents usecase', () => {
  afterEach(() => mockRepo.clear());

  it('tests that usecase mapping works', () => {
    let usecase = new SaveEventsUsecase(mockRepo, registry);
    usecase.execute({ events: mockEvents });

    const eventMap = mockRepo.getEventMap();

    expect(eventMap[REPORTING_TABLES.INVOICE].length).toEqual(1);
    expect(eventMap[REPORTING_TABLES.SUBMISSION].length).toEqual(1);
    expect(eventMap[REPORTING_TABLES.JOURNAL].length).toEqual(1);
    expect(eventMap[REPORTING_TABLES.USER].length).toEqual(1);

    expect(eventMap[REPORTING_TABLES.DEFAULT].length).toEqual(2);
  });
});
