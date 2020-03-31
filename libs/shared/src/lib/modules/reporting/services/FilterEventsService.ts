import { LoggerService } from '../../../domain/services/LoggerService';
import { EventDTO } from '../domain/EventDTO';
import { Event as EveEvent } from '@hindawi/eve';

export class FilterEventsService {
  constructor(private s3Service: AWS.S3, private logger: LoggerService) {}
  public async filterEvents(
    events: AWS.SQS.Message[] /* | EveEvent[] */
  ): Promise<EventDTO[]> {
    const { s3Service, logger } = this;
    let processedEvents: EventDTO[] = [];

    for (const event of events) {
      const { MessageId, Body } = event;
      let id = null;

      let isLongEvent = false;
      let parsedEvent = null;
      try {
        let body: EveEvent;
        if (Body) {
          body = JSON.parse(Body);
        } else if ((event as EveEvent).Message) {
          body = event as EveEvent;
        } else {
          throw new Error('Unknown event format');
        }
        id = body.MessageId;
        logger.debug(id);
        isLongEvent =
          body?.MessageAttributes?.['PhenomMessageTooLarge']?.Value === 'Y' ||
          body?.MessageAttributes?.['PhenomMessageTooLarge']?.stringValue ===
            'Y';
        parsedEvent = JSON.parse(body.Message);
      } catch (error) {
        logger.error('Failed to parse event: ' + MessageId);
        logger.debug(error);
        logger.debug(Body);
        continue;
      }

      if (isLongEvent) {
        try {
          const [Bucket, Key] = parsedEvent.data.split('::');
          logger.debug(`Getting event from bucket: ${Bucket}, key: ${Key}`);
          parsedEvent.data = JSON.parse(
            await s3Service
              .getObject({ Bucket, Key })
              .promise()
              .then(result => result.Body.toString())
          );
        } catch (error) {
          logger.error(error);
          logger.error(
            'Failed to get event from s3 ' +
              JSON.stringify({
                MessageId,
                parsedEvent
              })
          );
          continue;
        }
      }

      try {
        processedEvents.push({
          id,
          data: parsedEvent.data,
          event: parsedEvent.event.split(':').pop(),
          timestamp: parsedEvent.timestamp
            ? new Date(parsedEvent.timestamp)
            : new Date()
        });
      } catch (error) {
        logger.error(`Payload not correct for ${MessageId} `);
        logger.error(error);
      }
    }

    let filteredEvents = processedEvents.filter(
      e => !!e && e.event && e.id && e.data
    );
    if (events.length !== filteredEvents.length) {
      //TODO maybe save bad events to s3
      logger.info(
        'Filtered ' + (events.length - filteredEvents.length) + ' events'
      );
    }

    return filteredEvents;
  }
}
