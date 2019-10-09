import * as Rabbitjs from 'rabbit.js';

import {JobContract} from '../../../../../infrastructure/message-queues/contracts/Job';
import {ErrorHandlerContract} from '../../../../../infrastructure/message-queues/contracts/ErrorHandler';

export class RabbitMqJob extends JobContract {
  private socket: Rabbitjs.WorkerSocket;

  constructor(
    errorHandler: ErrorHandlerContract,
    payload: any,
    socket: Rabbitjs.WorkerSocket
  ) {
    super(errorHandler, payload);
    this.socket = socket;
  }

  public async delete(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        this.socket.ack();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public async release(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      try {
        this.socket.ack();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
