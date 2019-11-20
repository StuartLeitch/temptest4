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

  // const queue = await queueService;
  // queue.start();

  // queue.__LOCAL__.handler({
  //   submissionId: '7b61bbdc-d68a-46c3-8a78-6a3f67040de4',
  //   manuscripts: [
  //     {
  //       id: 'ac8be855-cef8-454a-86e9-347355957eaf',
  //       created: '2019-11-19T08:14:21.834Z',
  //       updated: '2019-11-19T08:15:07.267Z',
  //       customId: '1218339',
  //       submissionId: '7b61bbdc-d68a-46c3-8a78-6a3f67040de4',
  //       journalId: '1cce5e57-8b44-407c-8e05-9c066e1f15f9',
  //       title: 'INV-test-multiple versions',
  //       abstract: 'ssdsd',
  //       version: '1',
  //       conflictOfInterest: '',
  //       dataAvailability: 'ssd',
  //       fundingStatement: 'dsdsds',
  //       articleType: {
  //         name: 'Case Series'
  //       },
  //       authors: [
  //         {
  //           id: '31a9d8a0-7749-4461-95ec-dcc542603282',
  //           created: '2019-11-19T08:14:21.837Z',
  //           updated: '2019-11-19T08:14:55.154Z',
  //           surname: 'inv',
  //           givenNames: 'autor',
  //           email: 'georgiana.olaru+autor@hindawi.com',
  //           aff: 'addsds',
  //           country: 'AL',
  //           isSubmitting: true,
  //           isCorresponding: true
  //         }
  //       ],
  //       files: [
  //         {
  //           id: 'e8e4deb4-0e13-4c2a-a1f5-62d6c49db8f6',
  //           created: '2019-11-19T08:14:21.837Z',
  //           updated: '2019-11-19T08:14:22.436Z',
  //           type: 'manuscript',
  //           fileName: '02 Revenue Recognition.pdf',
  //           mimeType: 'application/pdf',
  //           size: 322902,
  //           originalName: '02 Revenue Recognition.pdf',
  //           providerKey:
  //             'ac8be855-cef8-454a-86e9-347355957eaf/7c8b4c16-da96-4805-bd5d-f641094c3bff'
  //         }
  //       ],
  //       editors: []
  //     },
  //     {
  //       id: 'ac8be855-cef8-454a-86e9-347355957eaf',
  //       created: '2019-11-19T08:30:05.845Z',
  //       updated: '2019-11-19T08:30:05.845Z',
  //       customId: '1218339',
  //       submissionId: '7b61bbdc-d68a-46c3-8a78-6a3f67040de4',
  //       journalId: '1cce5e57-8b44-407c-8e05-9c066e1f15f9',
  //       title: 'INV-test-multiple versions',
  //       abstract: 'ssdsd',
  //       version: '1.2',
  //       conflictOfInterest: '',
  //       dataAvailability: 'ssd',
  //       fundingStatement: 'dsdsds',
  //       articleType: {
  //         name: 'Case Series'
  //       },
  //       authors: [
  //         {
  //           id: '785e5339-c057-41d4-9bab-41320a992a81',
  //           created: '2019-11-19T08:30:05.850Z',
  //           updated: '2019-11-19T08:30:05.850Z',
  //           surname: 'inv',
  //           givenNames: 'autor',
  //           email: 'georgiana.olaru+autor@hindawi.com',
  //           aff: 'addsds',
  //           country: 'AL',
  //           isSubmitting: true,
  //           isCorresponding: true
  //         }
  //       ],
  //       files: [
  //         {
  //           id: 'edea9378-17a4-4312-b2fb-0581eb1ac3fa',
  //           created: '2019-11-19T08:30:05.850Z',
  //           updated: '2019-11-19T08:30:05.850Z',
  //           type: 'manuscript',
  //           fileName: '02 Revenue Recognition.pdf',
  //           mimeType: 'application/pdf',
  //           size: 322902,
  //           originalName: '02 Revenue Recognition.pdf',
  //           providerKey: null
  //         }
  //       ],
  //       editors: [
  //         {
  //           id: 'e69da3fd-0ce1-48d4-b3e3-f1ec7a873d3b',
  //           aff: 'ssdds',
  //           email: 'georgiana.olaru+ce1@hindawi.com',
  //           title: 'mrs',
  //           country: 'RO',
  //           surname: 'editor_inv',
  //           givenNames: 'chief',
  //           role: {
  //             type: 'triageEditor',
  //             label: 'Chief Editor'
  //           }
  //         },
  //         {
  //           id: '51364c0d-6b22-4a14-b484-4fe320a98690',
  //           aff: 'sdsd',
  //           email: 'georgiana.olaru+ae1@hindawi.com',
  //           title: 'mrs',
  //           country: 'AG',
  //           surname: 'editor_inv',
  //           givenNames: 'academic',
  //           role: {
  //             type: 'academicEditor',
  //             label: 'Academic Editor'
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       id: 'a3fdb064-9485-49ac-85f2-fe952a12a715',
  //       created: '2019-11-19T08:30:05.845Z',
  //       updated: '2019-11-19T08:31:24.435Z',
  //       customId: '1218339',
  //       submissionId: '7b61bbdc-d68a-46c3-8a78-6a3f67040de4',
  //       journalId: '1cce5e57-8b44-407c-8e05-9c066e1f15f9',
  //       title: 'INV-test-multiple versions_v2minor',
  //       abstract: 'ssdsd',
  //       version: '2',
  //       conflictOfInterest: '',
  //       dataAvailability: 'ssd',
  //       fundingStatement: 'dsdsds',
  //       articleType: {
  //         name: 'Case Series'
  //       },
  //       authors: [
  //         {
  //           id: 'c09302cf-6122-43b7-a941-5d2b2556490f',
  //           created: '2019-11-19T08:30:05.857Z',
  //           updated: '2019-11-19T08:30:44.196Z',
  //           surname: 'dsds',
  //           givenNames: 'dd',
  //           email: 'georgiana.olaru+autor2@hindawi.com',
  //           aff: 'dd',
  //           country: 'AR',
  //           isSubmitting: false,
  //           isCorresponding: true
  //         },
  //         {
  //           id: '7528d388-73d9-4325-8776-5c6deaf43d7c',
  //           created: '2019-11-19T08:30:05.857Z',
  //           updated: '2019-11-19T08:30:44.213Z',
  //           surname: 'inv',
  //           givenNames: 'autor',
  //           email: 'georgiana.olaru+autor@hindawi.com',
  //           aff: 'addsds',
  //           country: 'AL',
  //           isSubmitting: true,
  //           isCorresponding: false
  //         }
  //       ],
  //       files: [
  //         {
  //           id: 'a02895ce-7f33-463e-92b1-b16d248f4a8d',
  //           created: '2019-11-19T08:30:05.857Z',
  //           updated: '2019-11-19T08:30:06.655Z',
  //           type: 'manuscript',
  //           fileName: '02 Revenue Recognition.pdf',
  //           mimeType: 'application/pdf',
  //           size: 322902,
  //           originalName: '02 Revenue Recognition.pdf',
  //           providerKey:
  //             'a3fdb064-9485-49ac-85f2-fe952a12a715/a409f7c4-374c-40e7-9103-d96c20a14de1'
  //         }
  //       ],
  //       editors: [
  //         {
  //           id: 'bef865b4-fefe-4120-b659-afc4858b6c5e',
  //           aff: 'sdsd',
  //           email: 'georgiana.olaru+ae1@hindawi.com',
  //           title: 'mrs',
  //           country: 'AG',
  //           surname: 'editor_inv',
  //           givenNames: 'academic',
  //           role: {
  //             type: 'academicEditor',
  //             label: 'Academic Editor'
  //           }
  //         },
  //         {
  //           id: 'd1a8427d-6117-4d33-8456-68d402a56194',
  //           aff: 'ssdds',
  //           email: 'georgiana.olaru+ce1@hindawi.com',
  //           title: 'mrs',
  //           country: 'RO',
  //           surname: 'editor_inv',
  //           givenNames: 'chief',
  //           role: {
  //             type: 'triageEditor',
  //             label: 'Chief Editor'
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       id: 'a3fdb064-9485-49ac-85f2-fe952a12a715',
  //       created: '2019-11-19T08:30:05.845Z',
  //       updated: '2019-11-19T08:31:24.435Z',
  //       customId: '1218339',
  //       submissionId: '7b61bbdc-d68a-46c3-8a78-6a3f67040de4',
  //       journalId: '1cce5e57-8b44-407c-8e05-9c066e1f15f9',
  //       title: 'INV-test-multiple versions_v2.3minor',
  //       abstract: 'ssdsd',
  //       version: '2.3',
  //       conflictOfInterest: '',
  //       dataAvailability: 'ssd',
  //       fundingStatement: 'dsdsds',
  //       articleType: {
  //         name: 'Case Series'
  //       },
  //       authors: [
  //         {
  //           id: 'c09302cf-6122-43b7-a941-5d2b2556490f',
  //           created: '2019-11-19T08:30:05.857Z',
  //           updated: '2019-11-19T08:30:44.196Z',
  //           surname: 'dsds',
  //           givenNames: 'dd',
  //           email: 'georgiana.olaru+autor2@hindawi.com',
  //           aff: 'dd',
  //           country: 'AR',
  //           isSubmitting: false,
  //           isCorresponding: true
  //         },
  //         {
  //           id: '7528d388-73d9-4325-8776-5c6deaf43d7c',
  //           created: '2019-11-19T08:30:05.857Z',
  //           updated: '2019-11-19T08:30:44.213Z',
  //           surname: 'inv',
  //           givenNames: 'autor',
  //           email: 'georgiana.olaru+autor@hindawi.com',
  //           aff: 'addsds',
  //           country: 'AL',
  //           isSubmitting: true,
  //           isCorresponding: false
  //         }
  //       ],
  //       files: [
  //         {
  //           id: 'a02895ce-7f33-463e-92b1-b16d248f4a8d',
  //           created: '2019-11-19T08:30:05.857Z',
  //           updated: '2019-11-19T08:30:06.655Z',
  //           type: 'manuscript',
  //           fileName: '02 Revenue Recognition.pdf',
  //           mimeType: 'application/pdf',
  //           size: 322902,
  //           originalName: '02 Revenue Recognition.pdf',
  //           providerKey:
  //             'a3fdb064-9485-49ac-85f2-fe952a12a715/a409f7c4-374c-40e7-9103-d96c20a14de1'
  //         }
  //       ],
  //       editors: [
  //         {
  //           id: 'bef865b4-fefe-4120-b659-afc4858b6c5e',
  //           aff: 'sdsd',
  //           email: 'georgiana.olaru+ae1@hindawi.com',
  //           title: 'mrs',
  //           country: 'AG',
  //           surname: 'editor_inv',
  //           givenNames: 'academic',
  //           role: {
  //             type: 'academicEditor',
  //             label: 'Academic Editor'
  //           }
  //         },
  //         {
  //           id: 'd1a8427d-6117-4d33-8456-68d402a56194',
  //           aff: 'ssdds',
  //           email: 'georgiana.olaru+ce1@hindawi.com',
  //           title: 'mrs',
  //           country: 'RO',
  //           surname: 'editor_inv',
  //           givenNames: 'chief',
  //           role: {
  //             type: 'triageEditor',
  //             label: 'Chief Editor'
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       id: 'a3fdb064-9485-49ac-85f2-fe952a12a715',
  //       created: '2019-11-19T08:30:05.845Z',
  //       updated: '2019-11-19T08:31:24.435Z',
  //       customId: '1218339',
  //       submissionId: '7b61bbdc-d68a-46c3-8a78-6a3f67040de4',
  //       journalId: '1cce5e57-8b44-407c-8e05-9c066e1f15f9',
  //       title: 'INV-test-multiple versions_v2.2.7minor',
  //       abstract: 'ssdsd',
  //       version: '2.2.7',
  //       conflictOfInterest: '',
  //       dataAvailability: 'ssd',
  //       fundingStatement: 'dsdsds',
  //       articleType: {
  //         name: 'Case Series'
  //       },
  //       authors: [
  //         {
  //           id: 'c09302cf-6122-43b7-a941-5d2b2556490f',
  //           created: '2019-11-19T08:30:05.857Z',
  //           updated: '2019-11-19T08:30:44.196Z',
  //           surname: 'dsds',
  //           givenNames: 'dd',
  //           email: 'georgiana.olaru+autor2@hindawi.com',
  //           aff: 'dd',
  //           country: 'AR',
  //           isSubmitting: false,
  //           isCorresponding: true
  //         },
  //         {
  //           id: '7528d388-73d9-4325-8776-5c6deaf43d7c',
  //           created: '2019-11-19T08:30:05.857Z',
  //           updated: '2019-11-19T08:30:44.213Z',
  //           surname: 'inv',
  //           givenNames: 'autor',
  //           email: 'georgiana.olaru+autor@hindawi.com',
  //           aff: 'addsds',
  //           country: 'AL',
  //           isSubmitting: true,
  //           isCorresponding: false
  //         }
  //       ],
  //       files: [
  //         {
  //           id: 'a02895ce-7f33-463e-92b1-b16d248f4a8d',
  //           created: '2019-11-19T08:30:05.857Z',
  //           updated: '2019-11-19T08:30:06.655Z',
  //           type: 'manuscript',
  //           fileName: '02 Revenue Recognition.pdf',
  //           mimeType: 'application/pdf',
  //           size: 322902,
  //           originalName: '02 Revenue Recognition.pdf',
  //           providerKey:
  //             'a3fdb064-9485-49ac-85f2-fe952a12a715/a409f7c4-374c-40e7-9103-d96c20a14de1'
  //         }
  //       ],
  //       editors: [
  //         {
  //           id: 'bef865b4-fefe-4120-b659-afc4858b6c5e',
  //           aff: 'sdsd',
  //           email: 'georgiana.olaru+ae1@hindawi.com',
  //           title: 'mrs',
  //           country: 'AG',
  //           surname: 'editor_inv',
  //           givenNames: 'academic',
  //           role: {
  //             type: 'academicEditor',
  //             label: 'Academic Editor'
  //           }
  //         },
  //         {
  //           id: 'd1a8427d-6117-4d33-8456-68d402a56194',
  //           aff: 'ssdds',
  //           email: 'georgiana.olaru+ce1@hindawi.com',
  //           title: 'mrs',
  //           country: 'RO',
  //           surname: 'editor_inv',
  //           givenNames: 'chief',
  //           role: {
  //             type: 'triageEditor',
  //             label: 'Chief Editor'
  //           }
  //         }
  //       ]
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
