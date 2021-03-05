import {
  MicroframeworkSettings,
  MicroframeworkLoader,
} from 'microframework-w3tec';

import { env } from '../env';
import { Context } from '../builders';
import * as eventHandlers from '../queue_service/handlers';

export const queueServiceLoader: MicroframeworkLoader = async (
  settings: MicroframeworkSettings | undefined
) => {
  if (settings && env.aws.enabled) {
    const context: Context = settings.getData('context');

    const queue = context?.services?.qq;

    if (queue) {
      Object.keys(eventHandlers).forEach((eventHandler: string) => {
        const { handler, event } = eventHandlers[eventHandler];

        queue.registerEventHandler({
          event,
          handler: handler(context),
        });
      });
      queue.start();

      const aa: any = {
        created: new Date().toISOString(),
        id: '111111',
        submissionId: '91ed7077-2c13-4e5c-ae20-3dc38c59a481',
        updated: new Date('2021-02-03').toISOString(),
        manuscripts: [
          {
            abstract: '',
            version: 1,
            acceptedDate: new Date('2021-02-03').toISOString(),
            articleType: 'Research Article',
            customId: '8984900',
            title:
              'Evaluation of Juxta-Apical radiolucency as a risk factor to inferior alveolar nerve injury: CBCT study',
            authors: [
              {
                assignedDate: new Date().toISOString(),
                created: new Date().toISOString(),
                email: 'rares.stan@hindawi.com',
                givenNames: 'Rares',
                id: '11111',
                country: 'RO',
                surname: 'Stan',
                isCorresponding: true,
              },
            ],
          },
        ],
      };

      const apa = eventHandlers.SubmissionPeerReviewCycleCheckPassed.handler(
        context
      );
      await apa(aa);
    }
  }
};
