import { Event } from '../../../../modules/event';

function extractEventData(serializedEvent: string): Event | null {
  try {
    const partial = JSON.parse(serializedEvent.trim());
    const message: Event = {
      MessageAttributes: partial.messageAttributes,
      MessageId: partial.messageId,
      Message: partial.body
    };
    return message;
  } catch (e) {
    console.error(
      '[AWS] Object data cannot be JSON deserialized:',
      serializedEvent.trim()
    );
    console.error(e);
    return null;
  }
}

export function splitS3ObjectIntoEvents(objectContent: string): Event[] {
  if (!objectContent) {
    return [];
  }

  const events = objectContent
    .trim()
    .split(/\s*[\r\n]+\s*/g)
    .map(line => extractEventData(line))
    .filter(event => !!event);

  return events;
}
