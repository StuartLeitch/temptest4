import { Either } from '../../../../core/logic/Either';

import { ExternalOrderId } from '../../../external-order-id';

import { PayPalOrder } from './paypal-types';

interface OrderRequest {
  invoiceReferenceNumber: string;
  manuscriptCustomId: string;
  paymentTotal: number;
}

interface Service {
  createOrder(request: OrderRequest): Promise<Either<unknown, ExternalOrderId>>;
  getOrder(orderId: string): Promise<Either<unknown, PayPalOrder>>;
}

export { OrderRequest as PayPalOrderRequest, Service as PayPalServiceContract };
