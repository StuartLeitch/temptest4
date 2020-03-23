import { Manuscript } from '../../modules/manuscripts/domain/Manuscript';

import { AuthorReminderPayload } from './payloads';

export class PayloadBuilder {
  static authorReminder(manuscript: Manuscript): AuthorReminderPayload {
    return {
      manuscriptCustomId: manuscript.customId,
      recipientEmail: manuscript.authorEmail,
      recipientName: `${manuscript.authorFirstName} ${manuscript.authorSurname}`
    };
  }
}
