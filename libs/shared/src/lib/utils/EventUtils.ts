import { EventObject } from '@hindawi/phenom-events/src/lib/eventObject';
import { v4 as uuidv4 } from 'uuid';

export class EventUtils {
  public static createEventObject(): EventObject {
    return {
      id: uuidv4(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
  }
}
