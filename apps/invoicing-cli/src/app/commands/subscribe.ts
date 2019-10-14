import {GluegunToolbox} from 'gluegun';

module.exports = {
  name: 'subscribe',
  alias: ['sub'],
  description: 'Subscribe to local Queue Service and listen to emitted events',
  run: async (toolbox: GluegunToolbox) => {
    const {
      system,
      print: {
        // spin,
        debug,
        info,
        success,
        // error,
        colors: {yellow}
      },
      configService,
      createQueueService
    } = toolbox;

    info(yellow(`Node Environment = ${configService.get('NODE_ENV')}`));
    info(
      yellow(`AWS_SNS_SQS_REGION = ${configService.get('AWS_SNS_SQS_REGION')}`)
    );
    info(yellow(`AWS_SQS_ENDPOINT = ${configService.get('AWS_SQS_ENDPOINT')}`));
    info(yellow(`AWS_SNS_ENDPOINT = ${configService.get('AWS_SNS_ENDPOINT')}`));
    info(
      yellow(`AWS_SQS_QUEUE_NAME = ${configService.get('AWS_SQS_QUEUE_NAME')}`)
    );
    info(yellow(`AWS_SNS_TOPIC = ${configService.get('AWS_SNS_TOPIC')}`));

    debug('Create Queue Service...');
    const queueService = await createQueueService({
      region: configService.get('AWS_SNS_SQS_REGION'),
      accessKeyId: configService.get('AWS_SNS_SQS_ACCESS_KEY'),
      secretAccessKey: configService.get('AWS_SNS_SQS_SECRET_KEY'),
      snsEndpoint: configService.get('AWS_SNS_ENDPOINT'),
      sqsEndpoint: configService.get('AWS_SQS_ENDPOINT'),
      topicName: configService.get('AWS_SNS_TOPIC'),
      queueName: configService.get('AWS_SQS_QUEUE_NAME')
    });

    if ('start' in queueService) {
      debug('Queue Service created.');
      debug('Register Event Handlers...');

      queueService.registerEventHandler({
        event: 'ManuscriptSubmitted',
        handler: async data => {
          success(`Manuscript ID: ${data.manuscript.id}`);

          const {
            id: articleId,
            journalId,
            title,
            articleTypeId,
            created,
            teams: [
              {
                members: [
                  {
                    alias: {email, country, surname}
                  }
                ]
              }
            ]
          } = data.manuscript;

          const appCmd = `phenom ct ${articleId} ${journalId} ${title} ${articleTypeId} ${created} ${email} ${country} ${surname}`;

          const stdout = await system.run(appCmd);
          debug(stdout);
        }
      });

      queueService.registerEventHandler({
        event: 'ManuscriptRejected',
        handler: async data => {
          success(`Manuscript ID: ${data.manuscript.id}`);

          // do nothing yet
        }
      });

      queueService.registerEventHandler({
        event: 'ManuscriptAccepted',
        handler: async data => {
          success(`Manuscript ID: ${data.manuscript.id}`);

          // do nothing yet
        }
      });

      debug('Start Queue Service...');
      queueService.start();
    }
  }
};
