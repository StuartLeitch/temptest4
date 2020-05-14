import { SchedulingTime } from '../../../infrastructure/message-queues/contracts/Time';

import { Notification } from '../domain/Notification';

export const NOTIFICATION_DELAY_ERROR_PERCENTAGE = 0.85;

export function notificationsSentInLastDelay(
  notifications: Notification[],
  delay: number
): Notification[] {
  const now = new Date().getTime();
  const delayNormalized =
    delay * SchedulingTime.Day * NOTIFICATION_DELAY_ERROR_PERCENTAGE;

  return notifications.filter((notification) => {
    const delta = now - notification.dateSent.getTime();
    return delta < delayNormalized;
  });
}
