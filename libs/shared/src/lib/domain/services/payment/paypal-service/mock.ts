import { v4 as uuidv4 } from 'uuid';

import { Either, right, left } from '../../../../core/logic/Either';

import { ExternalOrderId } from '../../../../modules/payments/domain/external-order-id';

import {
  UnsuccessfulOrderRetrieval,
  UnsuccessfulOrderCreation,
  UnsuccessfulOrderCapture,
  UnexpectedError,
} from './errors';

import {
  PayPalServiceContract,
  PayPalOrderResponse,
  PayPalOrderRequest,
  PayPalOrderStatus,
} from './service';

interface Order {
  orderDetails: PayPalOrderResponse;
  orderId: ExternalOrderId;
}

export class MockPayPalService implements PayPalServiceContract {
  private orders: Order[] = [];

  async createOrder(
    request: PayPalOrderRequest
  ): Promise<
    Either<UnsuccessfulOrderCreation | UnexpectedError, ExternalOrderId>
  > {
    const order: Order = {
      orderDetails: {
        invoiceReferenceNumber: request.invoiceReferenceNumber,
        status: PayPalOrderStatus.CREATED,
        totalPayed: request.paymentTotal,
      },
      orderId: ExternalOrderId.create(uuidv4()),
    };
    this.orders.push(order);
    return right(order.orderId);
  }

  async getOrder(
    orderId: string
  ): Promise<
    Either<UnsuccessfulOrderRetrieval | UnexpectedError, PayPalOrderResponse>
  > {
    const order = this.orders.find((o) => o.orderId.toString() === orderId);

    if (order) {
      return right(order.orderDetails);
    } else {
      return left(new UnsuccessfulOrderRetrieval('order not found'));
    }
  }

  async captureMoney(
    orderId: string
  ): Promise<Either<UnsuccessfulOrderCapture, ExternalOrderId>> {
    const order = this.orders.find((o) => o.orderId.toString() === orderId);

    if (!order) {
      return left(new UnsuccessfulOrderCapture('order does not exist'));
    }

    if (order.orderDetails.status !== PayPalOrderStatus.APPROVED) {
      return left(
        new UnsuccessfulOrderCapture('order is not in `APPROVED` state')
      );
    }

    order.orderDetails.status = PayPalOrderStatus.COMPLETED;
    return right(order.orderId);
  }

  approveOrder(orderId: string) {
    const order = this.orders.find((o) => o.orderId.toString() === orderId);

    order.orderDetails.status = PayPalOrderStatus.APPROVED;
  }
}
