import { Either } from '../../../../core/logic/Either';

import { ExternalOrderId } from '../../../../modules/payments/domain/external-order-id';

import {
  UnsuccessfulOrderRetrieval,
  UnsuccessfulOrderCreation,
  UnsuccessfulOrderCapture,
  UnexpectedError,
} from './errors';

interface OrderRequest {
  netAmountBeforeDiscount: number;
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
  captureMoney(
    orderId: string
  ): Promise<Either<UnsuccessfulOrderCapture, ExternalOrderId>>;
}

export {
  OrderResponse as PayPalOrderResponse,
  OrderRequest as PayPalOrderRequest,
  OrderStatus as PayPalOrderStatus,
  Service as PayPalServiceContract,
};
