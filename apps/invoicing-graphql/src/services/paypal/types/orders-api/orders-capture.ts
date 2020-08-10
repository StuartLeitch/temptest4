import { ResponsePrefer } from '../request';
import { PayPalRequest } from '../request';

export interface OrdersCaptureRequest extends PayPalRequest {
  requestBody(orderActionRequest: Record<string, unknown>): this;
  payPalClientMetadataId(payPalClientMetadataId: string): this;
  payPalRequestId(payPalRequestId: string): this;
  prefer(prefer: ResponsePrefer): this;
}
