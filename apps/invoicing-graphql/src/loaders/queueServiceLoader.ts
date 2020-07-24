import { createQueueService } from '@hindawi/queue-service';

import {
  MicroframeworkLoader,
  MicroframeworkSettings,
} from 'microframework-w3tec';

import { env } from '../env';
import { Logger } from '../lib/logger';

import * as eventHandlers from '../queue_service/handlers';

const logger = new Logger();
logger.setScope(__filename);

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.aws.enabled) {
    const context = settings.getData('context');

    const config = {
      region: env.aws.sns.sqsRegion,
      accessKeyId: env.aws.sns.sqsAccessKey,
      secretAccessKey: env.aws.sns.sqsSecretKey,
      snsEndpoint: env.aws.sns.endpoint,
      sqsEndpoint: env.aws.sqs.endpoint,
      s3Endpoint: env.aws.s3.endpoint,
      topicName: env.aws.sns.topic,
      queueName: env.aws.sqs.queueName,
      bucketName: env.aws.s3.largeEventBucket,
      bucketPrefix: env.aws.s3.bucketPrefix,
      eventNamespace: env.app.eventNamespace,
      publisherName: env.app.publisherName,
      serviceName: env.app.name,
      defaultMessageAttributes: env.app.defaultMessageAttributes,
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

      // if (event === 'ArticlePublished') {
      //   queue.__LOCAL__ = {
      //     event,
      //     handler: handler.bind(context),
      //   };
      // }

      queue.registerEventHandler({
        event,
        handler: handler.bind(context),
      });
    });

    queue.start();
    context.qq = queue;

    // queue.__LOCAL__.handler({
    //   customId: '4217444',
    //   published: '2019-12-21 12:20:05',
    //   id: '1988801',
    //   articleType: 'Research Article',
    //   created: '2019-12-19 12:20:05',
    //   updated: '2019-12-19 12:20:05',
    //   doi: '10.1155/2019/1987935',
    //   journalId: '26a6d759-9379-48a0-a96c-5b4d233ffd75',
    //   specialIssueId: null,
    //   title: 'test autori multipli',
    //   authors: [
    //     {
    //       isCorresponding: false,
    //       aff: 'Turkish General Staff',
    //       email: 'jprojasarmas@yahoo.com',
    //       country: 'Turkey',
    //       surname: 'Rojas-Armas',
    //       givenNames: 'Juan Pedro',
    //     },
    //     {
    //       isCorresponding: false,
    //       aff: 'Turkish General Staff',
    //       email: 'jlarroyoa@gmail.com',
    //       country: 'Turkey',
    //       surname: 'Arroyo-Acevedo',
    //       givenNames: 'Jorge Luis',
    //     },
    //     {
    //       isCorresponding: false,
    //       aff: 'Department of Industrial Engineering',
    //       email: 'josemanuel4470@yahoo.es',
    //       country: 'Turkey',
    //       surname: 'Ortiz-S&#x00E1;nchez',
    //       givenNames: 'Jos&#x00E9; Manuel',
    //     },
    //     {
    //       isCorresponding: false,
    //       aff: 'Department of Anaesthesia',
    //       email: 'mirianpp7@hotmail.com',
    //       country: 'Australia',
    //       surname: 'Palomino-Pacheco',
    //       givenNames: 'Miriam',
    //     },
    //     {
    //       isCorresponding: false,
    //       aff: 'Turkish General Staff',
    //       email: 'hjustilg@unmsm.edu.pe',
    //       country: 'Turkey',
    //       surname: 'Hilario-Vargas',
    //       givenNames: 'Hugo Jesus',
    //     },
    //     {
    //       isCorresponding: true,
    //       aff: 'Department of Surgery',
    //       email: 'oherreracalderon@gmail.com',
    //       country: 'Australia',
    //       surname: 'Herrera-Calder&#x00F3;n',
    //       givenNames: 'Oscar',
    //     },
    //     {
    //       isCorresponding: false,
    //       aff: 'Department of Electronics and Information Engineering',
    //       email: 'jhilario63@yahoo.com',
    //       country: 'Japan',
    //       surname: 'Hilario-Vargas',
    //       givenNames: 'Julio',
    //     },
    //   ],
    //   abstract:
    //     'Medicinal plants are used throughout the world and the World Health Organization supports its use by recommending quality, safety and efficacy. Minthostachys mollis is distributed in the Andes of South America and is used by the population for various diseases. While studies have shown their pharmacological properties, the information about their safety is very limited. Then, the goal of this research was to determine the acute oral toxicity and in repeated doses during 28 days of Minthostachys mollis essential oil (Mm-EO) in rats. For the acute toxicity test two groups of rats, of three animals each, were used. Each group received Mm-EO in a single dose of 2000 or 300 mg/kg of body weight. For the repeated dose toxicity test, four groups of 10 rats each were used. Doses of 100, 250 and 500 mg/kg/day were used, one group was control. With the single dose of Mm-EO of 2000 mg/kg of body weight, the three rats in the group showed immediate signs of toxicity and died between 36 and 72 hours. In the lung, inflammatory infiltrate was observed, predominantly lymphocytic with severe hemorrhage and presence of macrophages with hemosiderin. In the repeated dose study, male rats (5/5) and female rats (2/5) died at the dose of 500 mg/kg/day. The body weight of both male and female rats decreased significantly with doses of 250 and 500 mg/kg/day. The serum levels of AST and ALT increased significantly and the histopathological study revealed chronic and acute inflammatory infiltrate in the lung; while in the liver was observed in 80% of the cases (24/30) mild chronic inflammatory infiltrate and in some of those cases there was vascular congestion and in one case cytoplasmic vacuolization. The Mm-EO presented moderate acute oral toxicity, while with repeated doses for 28 days; there was evidence of toxicity, in a dose-dependent manner, mainly at the hepatic level.',
    //   refCount: 33,
    //   volume: 2019,
    //   hasSupplementaryMaterials: false,
    //   figCount: 17,
    // });
  }
};
