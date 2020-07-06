import { PaymentClientToken } from '../../../domain/PaymentClientToken';

import { PayPalOrder } from './paypal-types';

interface OrderRequest {
  invoiceReferenceNumber: string;
  manuscriptCustomId: string;
  paymentTotal: number;
}

interface Service {
  fetchAccessToken: Promise<any>;
  getOrder(orderId: string): Promise<PayPalOrder>;
  createOrder(request: OrderRequest): Promise<PayPalOrder>;
}

export { Service as PayPalService };
