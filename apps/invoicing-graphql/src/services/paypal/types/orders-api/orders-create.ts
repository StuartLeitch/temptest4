import { PayPalOrderRequest } from '../paypal-order';
import { ResponsePrefer } from '../request';
import { PayPalRequest } from '../request';

export interface OrdersCreateRequest extends PayPalRequest {
  payPalPartnerAttributionId(payPalPartnerAttributionId: string): this;
  requestBody(order: PayPalOrderRequest): this;
  prefer(prefer: ResponsePrefer): this;
}
