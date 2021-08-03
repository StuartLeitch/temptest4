/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import corsMiddleware from 'cors';
import express from 'express';
import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';
import { SNS } from 'aws-sdk';

import { createQueueService } from '@hindawi/queue-service';

import {
  PayPalProcessFinishedUsecase,
  GetInvoicePdfUsecase,
  Roles,
} from '@hindawi/shared';

import { Context } from '../builders';
import {
  PayPalWebhookResponse,
  PayPalPaymentCapture,
} from '../services/paypal/types/webhooks';

import { env } from '../env';
import { PhenomSqsServiceContract } from '../queue_service/phenom-queue-service';

function extractCaptureId(data: PayPalPaymentCapture): string {
  const orderLink = data.links.find(
    (link) =>
      link.href.indexOf('captures') > -1 && link.href.indexOf('refund') === -1
  );
  const linkPathSplitted = orderLink.href.split('/');
  const orderId = linkPathSplitted[linkPathSplitted.length - 1];
  return orderId;
}

export const expressLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings) {
    const context: Context = settings.getData('context');

    const app = express();

    app.use(express.json());
    app.use(corsMiddleware());

    app.get('/api/invoice/:payerId', async (req, res) => {
      const {
        repos,
        services: { pdfGenerator, logger },
      } = context;
      const authContext = { roles: [Roles.PAYER] };

      const usecase = new GetInvoicePdfUsecase(
        repos.invoiceItem,
        repos.address,
        repos.manuscript,
        repos.invoice,
        repos.payer,
        repos.catalog,
        repos.coupon,
        repos.waiver,
        pdfGenerator,
        logger
      );

      const invoiceLink = req.headers.referer;
      const pdfEither = await usecase.execute(
        { payerId: req.params.payerId, invoiceLink },
        authContext
      );

      if (pdfEither.isLeft()) {
        return res.status(400).send(pdfEither.value.message);
      }

      const { fileName, file } = pdfEither.value;

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Length': file.length,
      });

      res.end(file);
    });

    app.post('/api/payments/process-finished', async (req, res) => {
      // TODO: Add validation on event
      const data: PayPalWebhookResponse<PayPalPaymentCapture> = req.body;
      const {
        repos: { payment },
        services: { logger },
      } = context;
      const authContext = { roles: [Roles.PAYER] };
      const usecase = new PayPalProcessFinishedUsecase(payment);
      const payPalOrderId = extractCaptureId(data.resource);

      logger.info(
        `Try to handle PayPal webhook for transaction finished, for transaction with foreignPaymentId on ${payPalOrderId}`
      );

      try {
        const result = await usecase.execute(
          {
            payPalEvent: data.event_type,
            payPalOrderId,
          },
          authContext
        );

        if (result.isLeft()) {
          logger.error(
            `Handling PayPal event finished with error ${
              result.value.message
            }. \nEvent had body {${JSON.stringify(req.body, null, 2)}}`,
            result.value
          );
          console.error(
            `Handling PayPal event finished with error ${
              result.value.message
            }. \nEvent had body {${JSON.stringify(req.body, null, 2)}}\n`,
            JSON.stringify(result.value, null, 2)
          );
          res.status(500);
        } else {
          res.status(200);
        }
      } catch (e) {
        logger.error(
          `While handling PayPal event an error ocurred {${
            e.message
          }}. \nEvent had body {${JSON.stringify(req.body, null, 2)}}`,
          e
        );
        console.error(
          `While handling PayPal event an error ocurred {${
            e.message
          }}. \nEvent had body {${JSON.stringify(req.body, null, 2)}}\n`,
          JSON.stringify(e, null, 2)
        );
        res.status(500);
      }

      res.send();
    });

    if (env.isTest || env.isDevelopment) {
      app.post('/api/register-invoice-erp', async (req, res) => {
        const data = req.body;
        const invoiceId: string = data.invoiceId;

        const config = {
          region: env.erpIntegration.awsSNSRegion,
          accessKeyId: env.erpIntegration.awsSNSAccessKey,
          secretAccessKey: env.erpIntegration.awsSNSSecretKey,
          snsEndpoint: env.erpIntegration.awsSNSEndpoint,
          sqsEndpoint: env.aws.sqs.endpoint,
          s3Endpoint: env.aws.s3.endpoint,
          topicName: env.erpIntegration.awsSNSTopic,
          queueName: env.aws.sqs.queueName,
          bucketName: env.aws.s3.largeEventBucket,
          bucketPrefix: env.aws.s3.bucketPrefix,
          eventNamespace: env.app.eventNamespace,
          publisherName: 'invoicing',
          serviceName: env.app.name,
          defaultMessageAttributes: {},
        };

        let queue: PhenomSqsServiceContract;

        try {
          queue = await createQueueService(config);

          queue.start();
        } catch (err) {
          console.log('--------- queue creation error -------------------');
          console.log(err);
          console.log('--------------------------------------------------');
        }

        const sns = new SNS({
          endpoint: env.erpIntegration.awsSNSEndpoint,
          accessKeyId: env.erpIntegration.awsSNSAccessKey,
          secretAccessKey: env.erpIntegration.awsSNSSecretKey,
          region: env.erpIntegration.awsSNSRegion,
        });

        const { TopicArn } = await sns
          .createTopic({ Name: env.erpIntegration.awsSNSTopic })
          .promise();

        try {
          await queue.publishMessage({
            data: {
              invoiceId: invoiceId,
            },
            event: 'PublishInvoice',
            messageAttributes: {
              step: 'PublishInvoice',
            },
          });

          // const aa: SNS.MessageAttributeMap = {
          //   step: {
          //     DataType: 'String',
          //     StringValue: 'PublishInvoice',
          //   },
          // };
          // await sns
          //   .publish({
          //     Message: JSON.stringify({ data: { invoiceId } }),
          //     MessageAttributes: aa,
          //     TopicArn,
          //   })
          //   .promise();
        } catch (err) {
          console.log('--------------- erp queue send error ---------------');
          console.error(err);
          console.log('----------------------------------------------------');
        }

        res.status(200);
        res.send();
      });
    }

    // Run application to listen on given port
    if (!env.isTest) {
      const server = app.listen(env.app.port);
      settings.setData('express_server', server);
    }

    // Here we can set the data for other loaders
    settings.setData('express_app', app);
  }
};
