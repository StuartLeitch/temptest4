import {BaseMockEmailCommunicator} from '../../../../../core/tests/mocks/BaseMockEmailCommunicator';
import {EmailCommunicatorContract} from '../contracts/EmailCommunicatorContract';

export class MockEmailCommunicator extends BaseMockEmailCommunicator
  implements EmailCommunicatorContract {
  constructor() {
    super();
  }

  public async sendEmail(message: any): Promise<void> {
    console.log(`Email containing "${message.message}" was sent!`);
  }
}
