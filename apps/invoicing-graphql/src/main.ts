import { makeDb } from './services/knex';

import { makeConfig } from './config';
import { makeContext } from './context';
import { makeGraphqlServer } from './graphql';
import { makeExpressServer } from './api';
import { queueService } from './queue_service';

async function main(): Promise<void> {
  const config = await makeConfig();
  const db = await makeDb(config);
  const context = makeContext(config, db);

  const graphqlServer = makeGraphqlServer(context);
  const expressServer = makeExpressServer(context);

  graphqlServer.applyMiddleware({
    app: expressServer,
    path: '/graphql'
  });

  const queue = await queueService;
  queue.start();

  // queue.__LOCAL__.handler({
  //   submissionId: 'ed28e018-7b3d-4e66-b744-4d791e7623bd',
  //   manuscripts: [
  //     {
  //       id: '35a4f133-5e1d-4aee-87b3-2b319a4aeeca',
  //       title: 'test invoice3',
  //       created: '2019-11-15T08:01:23.218Z',
  //       updated: '2019-11-15T08:01:52.981Z',
  //       customId: '4883216',
  //       abstract: 'dffd',
  //       version: 1,
  //       files: [
  //         {
  //           id: '714091ab-0a6b-4b0c-9dc8-18ce820fecf2',
  //           created: '2019-11-15T08:01:50.369Z',
  //           updated: '2019-11-15T08:01:50.369Z',
  //           type: 'manuscript',
  //           label: null,
  //           fileName: '01 Invoice Confirmation.pdf',
  //           url: null,
  //           mimeType: 'application/pdf',
  //           size: 237325,
  //           originalName: '01 Invoice Confirmation.pdf',
  //           position: null,
  //           providerKey:
  //             '35a4f133-5e1d-4aee-87b3-2b319a4aeeca/0165663e-d04a-496f-a5ca-a86c256146da'
  //         }
  //       ],
  //       reviews: [],
  //       journalId: '25dc63a9-67f4-4ae1-b41d-a09850263c64',
  //       sectionId: null,
  //       specialIssueId: null,
  //       conflictOfInterest: '',
  //       dataAvailability: 'sdds',
  //       fundingStatement: 'dsds',
  //       editors: [
  //         {
  //           id: '1f072c52-9b4e-4556-a424-82f833a04e9c',
  //           userId: '445e7273-14dd-4619-9b21-8ff0ead6092a',
  //           isCorresponding: null,
  //           aff: 'Hindawi Research',
  //           email: 'sabina.deliu+ea@hindawi.com',
  //           title: 'mrs',
  //           country: 'RO',
  //           surname: 'editorialAssistant',
  //           givenNames: 'EA',
  //           role: { type: 'editorialAssistant', label: 'Editorial Assistant' }
  //         }
  //       ],
  //       authors: [
  //         {
  //           id: '5c17c5c7-eb10-400d-beb7-3e4bd1e37ec2',
  //           created: '2019-11-15T08:01:43.486Z',
  //           updated: '2019-11-15T08:01:43.512Z',
  //           userId: '6793be84-4124-4c8d-b8ff-85a17226abb5',
  //           status: 'pending',
  //           position: 0,
  //           isSubmitting: true,
  //           isCorresponding: true,
  //           aff: 'dfd',
  //           email: 'geo240585@gmail.com',
  //           country: 'RO',
  //           surname: 'ddf',
  //           givenNames: 'dffd'
  //         }
  //       ],
  //       reviewers: [],
  //       articleType: { name: 'Research Article' }
  //     }
  //   ]
  // });

  expressServer.listen(process.env.PORT || 4000);
}

main().catch(err => {
  console.log('Unexpected error!');
  console.error(err);
  process.exit(1);
});
