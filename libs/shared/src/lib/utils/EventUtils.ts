import { EventObject } from '@hindawi/phenom-events/src/lib/eventObject';
import uuid from 'uuid/v4';

export class EventUtils {
  public static createEventObject(): EventObject {
    return {
      id: uuid(),
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
  }
}
