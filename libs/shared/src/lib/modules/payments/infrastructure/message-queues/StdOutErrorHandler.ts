import {ErrorHandlerContract} from '../../../../infrastructure/message-queues/contracts/ErrorHandler';

export class StdOutErrorHandler implements ErrorHandlerContract {
  handle(error: Error): any {
    if (error) {
      console.log(error);
    }
  }
}
