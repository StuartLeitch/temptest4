/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import * as checkoutNodeJsSDK from '@paypal/checkout-server-sdk';

import {
  PayPalServiceContract as ServiceContract,
  PayPalOrderResponse as OrderResponse,
  PayPalOrderRequest as OrderRequest,
  PayPalOrderStatus as OrderStatus,
  PayPalServiceErrors as Errors,
  ExternalOrderId,
  LoggerContract,
  Either,
  right,
  left,
} from '@hindawi/shared';

import {
  OrdersCaptureRequest,
  PayPalOrderResponse,
  OrdersCreateRequest,
  PayPalOrderRequest,
  PayPalEnvironment,
  OrdersGetRequest,
  PayPalHttpClient,
  ResponsePrefer,
  ItemCategory,
  PayPalIntent,
  Response,
} from './types';

export interface PayPalServiceData {
  clientSecret: string;
  environment: string;
  clientId: string;
}

export class PayPalService implements ServiceContract {
  private httpClient: PayPalHttpClient;

  constructor(connData: PayPalServiceData, private logger: LoggerContract) {
    this.httpClient = new checkoutNodeJsSDK.core.PayPalHttpClient(
      this.createEnvironment(connData)
    );
  }

  private createEnvironment({
    clientId,
    clientSecret,
    environment,
  }: PayPalServiceData): PayPalEnvironment {
    if (environment === 'live' || environment === 'production') {
      return new checkoutNodeJsSDK.core.LiveEnvironment(clientId, clientSecret);
    } else {
      return new checkoutNodeJsSDK.core.SandboxEnvironment(
        clientId,
        clientSecret
      );
    }
  }

  async createOrder(
    request: OrderRequest
  ): Promise<
    Either<
      Errors.UnsuccessfulOrderCreation | Errors.UnexpectedError,
      ExternalOrderId
    >
  > {
    const newOrder: PayPalOrderRequest = {
      intent: PayPalIntent.CAPTURE,
      purchase_units: [
        {
          description: `${request.manuscriptCustomId} Article Processing charges`,
          invoice_id: request.invoiceReferenceNumber,
          custom_id: request.invoiceId,
          amount: {
            value: request.paymentTotal.toString(),
            currency_code: 'USD',
            breakdown: {
              item_total: {
                value: request.netAmount.toString(),
                currency_code: 'USD',
              },
              tax_total: request.vatAmount
                ? {
                    value: request.vatAmount.toString(),
                    currency_code: 'USD',
                  }
                : undefined,
              discount: request.discountAmount
                ? {
                    value: request.discountAmount.toString(),
                    currency_code: 'USD',
                  }
                : undefined,
            },
          },
          items: [
            {
              description: `Article Processing charges for manuscript ${request.manuscriptCustomId}`,
              name: `Article Processing charges for manuscript ${request.manuscriptCustomId}`,
              category: ItemCategory.DIGITAL_GOODS,
              quantity: '1',
              unit_amount: {
                value: request.netAmount.toString(),
                currency_code: 'USD',
              },
              tax: {
                value: request.vatAmount.toString(),
                currency_code: 'USD',
              },
            },
          ],
        },
      ],
    };

    let response: Response<PayPalOrderResponse>;

    try {
      response = await this.httpClient.execute<PayPalOrderResponse>(
        this.createOrderRequest(newOrder)
      );
    } catch (e) {
      this.logger.error(`Error on paypal create order`, e);
      return left(new Errors.UnexpectedError(e));
    }

    if (response.statusCode >= 300) {
      this.logger.error(
        `Error on paypal create order with message: ${response.result.toString()}`
      );
      return left(
        new Errors.UnsuccessfulOrderCreation(response.result.toString())
      );
    }

    return right(ExternalOrderId.create(response.result.id));
  }

  async getOrder(
    orderId: string
  ): Promise<
    Either<
      Errors.UnsuccessfulOrderRetrieval | Errors.UnexpectedError,
      OrderResponse
    >
  > {
    let response: Response<PayPalOrderResponse>;

    try {
      response = await this.httpClient.execute<PayPalOrderResponse>(
        this.getOrderRequest(orderId)
      );
    } catch (e) {
      this.logger.error(`Error on paypal get order`, e);
      return left(new Errors.UnexpectedError(e));
    }

    if (response.statusCode >= 300) {
      this.logger.error(
        `Error on paypal get order with message: ${response.result.toString()}`
      );
      return left(
        new Errors.UnsuccessfulOrderRetrieval(response.result.toString())
      );
    }

    const order = response.result;
    const orderDetails: OrderResponse = {
      totalPayed: Number.parseFloat(order.purchase_units[0].amount.value),
      invoiceReferenceNumber: order.purchase_units[0].custom_id,
      status: (order.status as unknown) as OrderStatus,
    };

    return right(orderDetails);
  }

  async captureMoney(
    orderId: string
  ): Promise<
    Either<Errors.UnsuccessfulOrderCapture | Errors.UnexpectedError, unknown>
  > {
    let response: Response<PayPalOrderResponse>;

    try {
      response = await this.httpClient.execute<PayPalOrderResponse>(
        this.captureOrderRequest(orderId)
      );
    } catch (e) {
      this.logger.error(`Error on paypal capture order`, e);
      return left(new Errors.UnexpectedError(e));
    }

    if (response.statusCode >= 300) {
      this.logger.error(
        `Error on paypal get order with message: ${response.result.toString()}`
      );
      return left(
        new Errors.UnsuccessfulOrderCapture(response.result.toString())
      );
    }

    return right(response.result.purchase_units[0].payments.captures[0].id);
  }

  private createOrderRequest(payload: PayPalOrderRequest): OrdersCreateRequest {
    const newRequest: OrdersCreateRequest = new checkoutNodeJsSDK.orders.OrdersCreateRequest();

    newRequest.prefer(ResponsePrefer.REPRESENTATION);
    newRequest.requestBody(payload);

    return newRequest;
  }

  private getOrderRequest(orderId: string): OrdersGetRequest {
    const newRequest: OrdersGetRequest = new checkoutNodeJsSDK.orders.OrdersGetRequest(
      orderId
    );

    return newRequest;
  }

  private captureOrderRequest(orderId: string): OrdersCaptureRequest {
    const newRequest: OrdersCaptureRequest = new checkoutNodeJsSDK.orders.OrdersCaptureRequest(
      orderId
    );

    newRequest.prefer(ResponsePrefer.REPRESENTATION);
    newRequest.requestBody({});

    return newRequest;
  }
}
