import { GluegunToolbox } from 'gluegun'
import * as shell from 'shelljs'

module.exports = {
  name: 'publish',
  description:
    'Publishes a fake `ManuscriptSubmitted` event to trigger the execution of `createTransaction` usecase',
  run: async (toolbox: GluegunToolbox) => {
    const {
      print: { debug }
    } = toolbox

    debug('Publish a fake ManuscriptSubmitted Event...')

    const fakeManuscript = {
      id: 'd312c43f-9fde-4e2c-9091-075e501798e4',
      journalId: 'cbe06eaa-66b9-4849-839f-3d75f233357e',
      created: '2019-08-26T07:21:33.107Z',
      updated: '2019-08-26T07:21:50.606Z',
      status: 'technicalChecks',
      title: '123',
      abstract: 'hei',
      customId: '4093107',
      publicationDates: [{ date: 1566804110596, type: 'technicalChecks' }],
      version: 1,
      hasPassedEqs: null,
      hasPassedEqa: null,
      technicalCheckToken: 'a0944258-96b8-4ea5-9872-0cf71c289a20',
      submissionId: '026b0e04-babc-4ed4-a398-39926b9f1613',
      agreeTc: true,
      conflictOfInterest: '',
      dataAvailability: '',
      fundingStatement: '',
      articleTypeId: '937261c4-46ff-486b-8651-537d0fa59744',
      teams: [
        {
          id: '5bc49cbd-ad41-4e1f-93c4-85705b2d45a3',
          created: '2019-08-26T07:21:33.122Z',
          updated: '2019-08-26T07:21:33.122Z',
          role: 'author',
          manuscriptId: 'd312c43f-9fde-4e2c-9091-075e501798e4',
          journalId: null,
          members: [
            {
              id: 'b15f11bc-00c9-4941-9476-48413817efe4',
              created: '2019-08-26T07:21:33.170Z',
              updated: '2019-08-26T07:21:33.170Z',
              userId: '5ea66175-a0a0-4a5f-bce5-60aedfc0a702',
              teamId: '5bc49cbd-ad41-4e1f-93c4-85705b2d45a3',
              position: 0,
              isSubmitting: true,
              isCorresponding: true,
              status: 'pending',
              alias: {
                aff: 'ts',
                email: 'anca.ursachi+author@thinslices.com',
                title: 'miss',
                country: 'AX',
                surname: 'Author',
                givenNames: 'Author'
              },
              reviewerNumber: null,
              responded: null
            }
          ]
        }
      ],
      articleType: {
        id: '937261c4-46ff-486b-8651-537d0fa59744',
        created: '2019-05-31T09:50:47.292Z',
        updated: '2019-05-31T09:50:47.292Z',
        name: 'Letter to the Editor',
        hasPeerReview: false
      },
      files: [
        {
          id: '19426470-c4b9-439d-8bd3-1f50848b0725',
          manuscriptId: 'd312c43f-9fde-4e2c-9091-075e501798e4',
          commentId: null,
          created: '2019-08-26T07:21:48.563Z',
          updated: '2019-08-26T07:21:48.563Z',
          type: 'manuscript',
          label: null,
          fileName: '1.pdf',
          url: null,
          mimeType: 'application/pdf',
          size: 1066511,
          originalName: '1.pdf',
          position: null
        }
      ],
      journal: {
        id: 'cbe06eaa-66b9-4849-839f-3d75f233357e',
        created: '2019-05-20T10:20:59.452Z',
        updated: '2019-07-29T09:00:54.062Z',
        name: 'Bioinorganic Chemistry and Applications',
        publisherName: 'Hindawi Limited',
        code: '323232',
        email: 'anca.ursachi+ea@thinslices.com',
        issn: '',
        apc: 3000,
        isActive: true,
        activationDate: '2019-07-02T00:00:00.000Z',
        peerReviewModelId: '5db88455-5cb6-4199-b028-b94b8faac99f'
      },
      journalName: 'Bioinorganic Chemistry and Applications',
      editorialAssistant: {
        aff: 'ts',
        email: 'anca.ursachi+admin@thinslices.com',
        title: null,
        country: 'AX',
        surname: 'admin',
        givenNames: 'admin'
      }
    }

    const message = {
      event: 'ManuscriptSubmitted',
      data: { manuscript: fakeManuscript }
    }

    // const publishCommand = `aws sns publish --topic-arn arn:aws:sns:us-east-1:1465414804035:test1 --endpoint-url http://localhost:9911 --message "{\"event\": \"ManuscriptSubmitted\", \"data\": {}}"`

    const publishCommand = `aws sns publish --topic-arn arn:aws:sns:us-east-1:1465414804035:test1 --endpoint-url http://localhost:9911 --message "${JSON.stringify(
      message
    ).replace(/"/g, '\\"')}"`

    // info(publishCommand)
    shell.exec(publishCommand)
  }
}
