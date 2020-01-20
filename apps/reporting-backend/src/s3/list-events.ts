import { makeCallback } from '../utils';

export function listEvents(bucket, callback) {
  const cb = makeCallback(callback);

  bucket.getObjects(object => {
    const { event, data, attributes, messageId } = object;
    if (event == null) {
      let body = JSON.parse(object.body);
      cb({
        messageId,
        eventName: body.event,
        payload: body,
        timeStamp: attributes.SentTimestamp
      });

      return;
    }

    const entry = { messageId, eventName: event, payload: data };
    if (data.manuscripts != null) {
      for (const manuscript of data.manuscripts) {
        cb({
          ...entry,
          timeStamp: manuscript.created
        });
      }
    } else if (typeof data.created === 'string') {
      cb({
        ...entry,
        timeStamp: data.created
      });
    } else {
      const dates = Object.entries(data).filter(([key, val]) =>
        /Date$/.test(key)
      );
      for (const [key, value] of dates) {
        cb({
          ...entry,
          timeStamp: value
        });
        break; // TODO (is this the right approach?)
      }
    }
  });

  return cb._result;
}
