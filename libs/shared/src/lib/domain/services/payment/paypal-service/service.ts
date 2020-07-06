import { Either } from '../../../../core/logic/Either';

import { ExternalOrderId } from '../../../external-order-id';

import {
  UnsuccessfulOrderRetrieval,
  UnsuccessfulOrderCreation,
  UnexpectedError,
} from './errors';

interface OrderRequest {
  invoiceReferenceNumber: string;
  manuscriptCustomId: string;
  discountAmount: number;
  paymentTotal: number;
  invoiceId: string;
  netAmount: number;
  vatAmount: number;
}

export enum OrderStatus {
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  CREATED = 'CREATED',
  VOIDED = 'VOIDED',
  SAVED = 'SAVED',
}

interface OrderResponse {
  invoiceReferenceNumber: string;
  status: OrderStatus;
  totalPayed: number;
}

interface Service {
  createOrder(
    request: OrderRequest
  ): Promise<
    Either<UnsuccessfulOrderCreation | UnexpectedError, ExternalOrderId>
  >;
  getOrder(
    orderId: string
  ): Promise<
    Either<UnsuccessfulOrderRetrieval | UnexpectedError, OrderResponse>
  >;
}

export {
  OrderResponse as PayPalOrderResponse,
  OrderRequest as PayPalOrderRequest,
  OrderStatus as PayPalOrderStatus,
  Service as PayPalServiceContract,
};
