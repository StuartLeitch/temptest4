const { createQueueService } = require('@hindawi/queue-service');

import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';

import { env } from '../env';
import { Logger } from '../lib/logger';

import * as eventHandlers from '../queue_service/handlers';

const logger = new Logger('queueService:loader');

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  const context = settings.getData('context');

  const config = {
    accessKeyId: env.aws.sns.sqsAccessKey,
    secretAccessKey: env.aws.sns.sqsSecretKey,
    region: env.aws.sns.sqsRegion,
    snsEndpoint: env.aws.sns.endpoint,
    sqsEndpoint: env.aws.sqs.endpoint,
    topicName: env.aws.sns.topic,
    queueName: env.aws.sqs.queueName,
    eventNamespace: env.app.eventNamespace,
    publisherName: env.app.publisherName,
    serviceName: env.app.name
  };

  let queue: any;
  try {
    queue = await createQueueService(config);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  Object.keys(eventHandlers).forEach((eventHandler: string) => {
    const { handler, event } = eventHandlers[eventHandler];

    if (event === 'SubmissionSubmitted') {
      queue.__LOCAL__ = {
        event,
        handler: handler.bind(context)
      };
    }

    queue.registerEventHandler({
      event,
      handler: handler.bind(context)
    });
  });

  queue.start();
  context.qq = queue;

  queue.__LOCAL__.handler({
    submissionId: 'georgiana-e-ofticata',
    manuscripts: [
      {
        id: '439303d8-bdb4-43f2-a7e0-7a4a341a04a1',
        journalId: '46a25365-57d4-44af-b041-3935ad3796dd',
        created: '2019-11-06T09:53:00.361Z',
        updated: '2019-11-06T09:58:27.365Z',
        title: 'Renal Replacement Therapy in the Critical Care Setting',
        abstract:
          'Renal replacement therapy (RRT) is frequently required to manage critically ill patients with acute kidney injury (AKI). There is limited evidence to support the current practice of RRT in intensive care units (ICUs). Recently published randomized control trials (RCTs) have further questioned our understanding of RRT in critical care. The optimal timing and dosing continues to be debatable; however, current evidence suggests delayed strategy with less intensive dosing when utilising RRT. Various modes of RRT are complementary to each other with no definite benefits to mortality or renal function preservation. Choice of anticoagulation remains regional citrate anticoagulation in continuous renal replacement therapy (CRRT) with lower bleeding risk when compared with heparin. RRT can be used to support resistant cardiac failure, but evolving therapies such as haemoperfusion are currently not recommended in sepsis.',
        customId: '3980345',
        version: '1',
        conflictOfInterest: '',
        dataAvailability: 'test',
        fundingStatement: 'yes',
        sectionId: null,
        specialIssueId: null,
        files: [
          {
            id: '81400b99-4119-4222-a80e-e28942b9fa7c',
            created: '2019-11-06T09:56:31.484Z',
            updated: '2019-11-06T09:56:31.484Z',
            type: 'manuscript',
            label: null,
            fileName: 'manuscript copy 2.pdf',
            url: null,
            mimeType: 'application/pdf',
            size: 140477,
            originalName: 'manuscript copy 2.pdf',
            position: null,
            providerKey:
              '439303d8-bdb4-43f2-a7e0-7a4a341a04a1/8a0ffb71-7698-4c76-8bdf-87368ece5669'
          }
        ],
        articleType: {
          name: 'Research Article'
        },
        reviews: [
          {
            id: '26e3e086-db1a-4e3a-9b8b-57e3901b9a96',
            reviewerId: '7c109fe8-4ec7-4bc9-b1fb-80899eb26b7c',
            created: '2019-11-06T09:57:44.527Z',
            updated: '2019-11-06T09:57:55.460Z',
            submitted: '2019-11-06T07:57:55.455Z',
            recommendation: 'publish',
            comments: [
              {
                id: '80a560a2-2fae-44b4-8af3-4f548adea5dc',
                created: '2019-11-06T09:57:44.546Z',
                updated: '2019-11-06T09:57:53.490Z',
                type: 'public',
                content: 'all good',
                files: []
              }
            ]
          },
          {
            id: 'c811edb3-3b7d-4aa1-87e4-d03fa02208b4',
            reviewerId: 'b7ec7fc4-5c3f-49cc-a5fd-81d8a03a7053',
            created: '2019-11-06T09:58:14.114Z',
            updated: '2019-11-06T09:58:14.114Z',
            submitted: '2019-11-06T07:58:14.112Z',
            recommendation: 'publish',
            comments: [
              {
                id: '5a7d0ee1-fced-4789-96f5-f005048ea59f',
                created: '2019-11-06T09:58:14.127Z',
                updated: '2019-11-06T09:58:14.127Z',
                type: 'public',
                content: 'publish with ae as well',
                files: []
              }
            ]
          },
          {
            id: '97883057-89c1-4dea-b32d-18791d588f25',
            reviewerId: '80cb0d12-63cd-490b-ae1d-2ac1584242f0',
            created: '2019-11-06T09:58:27.347Z',
            updated: '2019-11-06T09:58:27.347Z',
            submitted: '2019-11-06T07:58:27.345Z',
            recommendation: 'publish',
            comments: []
          }
        ],
        authors: [
          {
            id: '493e1e9c-1b1b-4ea4-bf4d-46786e4f0a7e',
            created: '2019-11-06T09:56:06.346Z',
            updated: '2019-11-06T09:56:06.422Z',
            userId: 'dda62ea8-4f91-4fd6-9902-8a2cf9197b6b',
            isSubmitting: true,
            isCorresponding: true,
            status: 'pending',
            aff: 'Hin',
            email: 'lucian.lature@hindawi.com',
            country: 'RO',
            surname: 'Lucian',
            givenNames: 'Lature'
          }
        ],
        reviewers: [
          {
            id: '7c109fe8-4ec7-4bc9-b1fb-80899eb26b7c',
            created: '2019-11-06T09:57:28.925Z',
            updated: '2019-11-06T09:57:55.504Z',
            userId: '23c567d8-49db-45d6-bb7b-0c78e32a7dc0',
            status: 'submitted',
            email: 'email+rev@domain.com',
            surname: 'rev',
            givenNames: 'rev',
            responded: '2019-11-06T05:57:44.439Z'
          }
        ],
        editors: [
          {
            id: '80a32365-939e-4813-a320-7802d82001b2',
            userId: 'a6d95e36-5370-43af-935c-9daaac694b8f',
            aff: 'Hin',
            email: 'email+ae2@domain.com',
            title: 'miss',
            country: 'RO',
            surname: 'ae2',
            givenNames: 'ae2',
            role: {
              type: 'academicEditor',
              label: 'Academic Editor'
            }
          }
        ]
      }
    ]
  });

  if (settings) {
    // settings.onShutdown(() => queue.disconnect());
  }
};
