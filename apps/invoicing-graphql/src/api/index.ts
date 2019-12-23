import express from 'express';
import {
  ErpData,
  RecordPaymentUsecase,
  GetInvoicePdfUsecase,
  Roles,
  UniqueEntityID,
  InvoiceId,
  ManuscriptId,
  Journal,
  Name
} from '@hindawi/shared';

import { Context } from '../context';
import { AuthMiddleware } from './middleware/auth';
import { PublishInvoiceToErpUsecase } from 'libs/shared/src/lib/modules/invoices/usecases/publishInvoiceToErp/publishInvoiceToErp';

import corsMiddleware from 'cors';

export function makeExpressServer(context: Context) {
  const app = express();
  const auth = new AuthMiddleware(context);
  app.use(express.json());
  app.use(corsMiddleware());

  app.post('/api/checkout', async (req, res) => {
    const { checkoutService } = context;

    const payment = req.body;

    const transaction = await checkoutService.pay(payment);

    const useCase = new RecordPaymentUsecase(
      context.repos.payment,
      context.repos.invoice
    );

    const resultEither = await useCase.execute(transaction);

    if (resultEither.isLeft()) {
      console.log(resultEither.value.errorValue());
      return res.status(500);
    } else {
      return resultEither.value.getValue();
    }
  });

  app.get('/api/jwt-test', auth.enforce(), (req, res) => {
    res.status(200).json(req.auth);
  });

  // TODO REMOVE THIS !!!
  app.post('/api/acceptManuscript', async (req, res) => {
    const invoiceId = req.body.invoiceId;
    const invoiceItems = await context.repos.invoiceItem.getItemsByInvoiceId(
      InvoiceId.create(new UniqueEntityID(invoiceId)).getValue()
    );
    const manuscript = await context.repos.manuscript.findById(
      invoiceItems[0].manuscriptId
    );

    context.qq.publishMessage({
      event: 'SubmissionQualityCheckPassed',
      data: {
        submissionId: manuscript.id.toString(),
        manuscripts: [
          {
            id: new UniqueEntityID().toString(),
            created: '2019-11-29T08:55:50.555Z',
            updated: '2019-11-29T08:56:19.743Z',
            customId: '4217444',
            submissionId: manuscript.id.toString(),
            journalId: manuscript.journalId.toString(),
            title: manuscript.title,
            abstract: 'ss',
            version: '1',
            conflictOfInterest: '',
            dataAvailability: 'sds',
            fundingStatement: 'sdsd',
            articleType: {
              name: 'Research Article'
            },
            authors: [
              {
                id: new UniqueEntityID().toString(),
                created: '2019-11-27T08:55:50.560Z',
                updated: '2019-11-27T08:56:08.640Z',
                surname: 'GENERATED',
                givenNames: 'GENERATED',
                email: 'georgiana.olaru+autor@hindawi.com',
                aff: 'University of Madrid',
                country: 'ES',
                isSubmitting: true,
                isCorresponding: true
              }
            ],
            files: [
              {
                id: 'a6a95fa3-56d5-4291-9c08-4113a30c50c0',
                created: '2019-11-27T08:55:50.560Z',
                updated: '2019-11-27T08:55:51.139Z',
                type: 'manuscript',
                fileName: '02 Revenue Recognition.pdf',
                mimeType: 'application/pdf',
                size: 322902,
                originalName: '02 Revenue Recognition.pdf',
                providerKey:
                  '8250aba9-4f34-491b-be13-1edcae7ff4ba/b36c1c6c-c19b-4736-9a80-ccde58c3e7e4'
              }
            ],
            editors: [
              {
                id: '4abd8def-df8c-46f5-b5ac-e26ed8b4c151',
                aff: 'sdsd',
                email: 'georgiana.olaru+ae1@hindawi.com',
                title: 'mrs',
                country: 'AG',
                surname: 'editor_inv',
                givenNames: 'academic',
                role: {
                  type: 'academicEditor',
                  label: 'Academic Editor'
                }
              },
              {
                id: 'bf5a9e26-91f8-4af1-a09c-800de1b5b543',
                aff: 'ssdds',
                email: 'georgiana.olaru+ce1@hindawi.com',
                title: 'mrs',
                country: 'RO',
                surname: 'editor_inv',
                givenNames: 'chief',
                role: {
                  type: 'triageEditor',
                  label: 'Chief Editor'
                }
              }
            ]
          }
        ],
        date: '2019-11-29T08:56:19.762Z',
        figCount: '000',
        refCount: '000',
        pageCount: '000',
        es: null,
        esLeaders: [],
        qc: {
          surname: 'INV',
          givenNames: 'quality_checker',
          email: 'georgiana.olaru+qc1@hindawi.com'
        },
        qcLeaders: [
          {
            surname: 'INV2',
            givenNames: 'team_leade',
            email: 'georgiana.olaru+tl2@hindawi.com'
          }
        ],
        ea: {
          surname: 'Assistant INV',
          givenNames: 'editorial',
          email: 'georgiana.olaru+ea@hindawi.com'
        }
      }
    });
    res.json({});
  });

  app.get('/api/invoice/:payerId', async (req, res) => {
    const { repos } = context;
    const authContext = { roles: [Roles.PAYER] };

    const usecase = new GetInvoicePdfUsecase(
      repos.invoiceItem,
      repos.address,
      repos.manuscript,
      repos.invoice,
      repos.payer,
      repos.catalog
    );

    const invoiceLink = req.headers.referer;
    const pdfEither = await usecase.execute(
      { payerId: req.params.payerId, invoiceLink },
      authContext
    );

    if (pdfEither.isLeft()) {
      return res.status(400).send(pdfEither.value.errorValue());
    } else {
      const { fileName, file } = pdfEither.value.getValue();
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Length': file.length
      });
      res.end(file);
    }
  });

  return app;
}
