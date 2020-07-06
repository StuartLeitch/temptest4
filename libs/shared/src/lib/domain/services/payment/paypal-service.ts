import { ExternalOrderId } from '../../external-order-id';

import { PayPalOrder } from './paypal-types';

interface OrderRequest {
  invoiceReferenceNumber: string;
  manuscriptCustomId: string;
  paymentTotal: number;
}

interface Service {
  createOrder(request: OrderRequest): Promise<ExternalOrderId>;
  getOrder(orderId: string): Promise<PayPalOrder>;
}

export { OrderRequest as PayPalOrderRequest, Service as PayPalServiceContract };
