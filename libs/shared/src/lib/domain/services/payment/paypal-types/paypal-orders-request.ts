import { PayPalRequest as Request } from './request';
import { PayPalOrder as Order } from './paypal-order';

export interface PayPalOrdersRequest {
  get(orderId: string): Request;
  patch(orderId: string, contents: Record<string, unknown>): Request;
  validate(
    orderId: string,
    action: Record<string, unknown>,
    clientMetadataId: string
  ): Request;
  create(partnerAttributionId: string, order: Order, prefer: string): Request;
  capture(
    orderId: string,
    clientMetadataId: string,
    requestId: string,
    action: Record<string, unknown>,
    prefer: string
  ): Request;
  authorize(
    orderId: string,
    clientMetadataId: string,
    requestId: string,
    action: Record<string, unknown>,
    prefer: string
  ): Request;
}
