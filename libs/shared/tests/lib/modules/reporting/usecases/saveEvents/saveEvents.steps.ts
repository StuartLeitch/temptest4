import { expect } from 'chai';
import { Given, When, Then, Before } from '@cucumber/cucumber';

import { REPORTING_TABLES } from './../../../../../../src/lib/modules/reporting/constants';
import { EventDTO } from './../../../../../../src/lib/modules/reporting/domain/EventDTO';
import { MockEventsRepo } from './../../../../../../src/lib/modules/reporting/repos/implementation/MockEventsRepo';
import { EventMappingdefaultRegistry } from './../../../../../../src/lib/modules/reporting/EventMappingRegistry';

import { SaveEventsUsecase } from './../../../../../../src/lib/modules/reporting/usecases/saveEvents/saveEvents';

import {
  InvoiceMappingPolicy,
  SubmissionMappingPolicy,
  JournalMappingPolicy,
  UserMappingPolicy,
} from './../../../../../../src/lib/modules/reporting/policies';

let mockEventsRepo: MockEventsRepo;
let registry;
let mockEvents: EventDTO[];

let useCase: SaveEventsUsecase;

Before(function () {
  mockEventsRepo = new MockEventsRepo();
  registry = new EventMappingdefaultRegistry();

  registry.addPolicy(new InvoiceMappingPolicy());
  registry.addPolicy(new SubmissionMappingPolicy());
  registry.addPolicy(new JournalMappingPolicy());
  registry.addPolicy(new UserMappingPolicy());

  useCase = new SaveEventsUsecase(mockEventsRepo, registry);
});

Given(
  'There is a list of events: {string}, {string}, {string}, {string}, {string}, {string}',
  function (
    submissionSubmitted: string,
    journalAdded: string,
    invoicePaid: string,
    userAdded: string,
    randomDump: string,
    randomDump2: string
  ) {
    mockEvents = [
      {
        id: '1',
        event: submissionSubmitted,
        data: { id: '', created: new Date() },
        timestamp: new Date(),
      },
      {
        id: '2',
        event: journalAdded,
        data: {},
        timestamp: new Date(),
      },
      {
        id: '3',
        event: invoicePaid,
        data: {},
        timestamp: new Date(),
      },
      {
        id: '4',
        event: userAdded,
        data: {},
        timestamp: new Date(),
      },
      {
        id: '5',
        event: randomDump,
        data: {},
        timestamp: new Date(),
      },
      {
        id: '6',
        event: randomDump2,
        data: {},
        timestamp: new Date(),
      },
    ];
  }
);

When('I try to save the events', function () {
  useCase.execute({ events: mockEvents });
});

Then('The events are saved and correctly mapped', function () {
  const eventMap = mockEventsRepo.getEventMap();

  expect(eventMap[REPORTING_TABLES.INVOICE].length).to.equal(1);
  expect(eventMap[REPORTING_TABLES.SUBMISSION].length).to.equal(1);
  expect(eventMap[REPORTING_TABLES.JOURNAL].length).to.equal(1);
  expect(eventMap[REPORTING_TABLES.USER].length).to.equal(1);

  expect(eventMap[REPORTING_TABLES.DEFAULT].length).to.equal(2);
});
