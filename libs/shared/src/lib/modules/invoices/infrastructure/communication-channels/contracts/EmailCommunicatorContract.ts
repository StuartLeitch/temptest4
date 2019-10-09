import {EmailCommunicator} from '../../../../../infrastructure/communication-channels/EmailCommunicator';

export interface EmailCommunicatorContract extends EmailCommunicator {
  sendEmail(message: any): Promise<void>;
}
