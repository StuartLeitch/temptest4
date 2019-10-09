import {EncoderContract} from '../../../../infrastructure/message-queues/contracts/Encoder';

export class JsonEncoder implements EncoderContract {
  encode(payload: any): any {
    return JSON.stringify(payload);
  }

  decode(payload: string): any {
    return JSON.parse(payload);
  }
}
