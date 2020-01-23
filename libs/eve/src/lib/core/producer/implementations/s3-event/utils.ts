import { Event } from '../../../../modules/event';

function extractEventData(serializedEvent: string): Event | null {
  try {
    return JSON.parse(serializedEvent.trim());
  } catch {
    console.error(
      '[AWS] Object data cannot be JSON deserialized:',
      serializedEvent.trim()
    );
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
