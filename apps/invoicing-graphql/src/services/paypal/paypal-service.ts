/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import * as checkoutNodeJsSDK from '@paypal/checkout-server-sdk';

import {
  PayPalServiceContract as ServiceContract,
  PayPalOrderResponse as OrderResponse,
  PayPalOrderRequest as OrderRequest,
  PayPalOrderStatus as OrderStatus,
  PayPalServiceErrors as Errors,
  GetPaymentsByInvoiceIdContext,
  GetPaymentsByInvoiceIdUsecase,
  GetPaymentMethodByNameContext,
  GetPaymentMethodByNameUsecase,
  PaymentMethodRepoContract,
  InvoiceRepoContract,
  PaymentRepoContract,
  ExternalOrderId,
  PaymentMethodId,
  LoggerContract,
  PaymentStatus,
  PaymentProof,
  UseCaseError,
  AsyncEither,
  Either,
  Roles,
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

interface WithInvoiceId {
  invoiceId: string;
}

interface WithPaymentMethodId {
  paymentMethodId: PaymentMethodId;
  invoiceId: string;
}

export interface PayPalServiceData {
  clientSecret: string;
  environment: string;
  clientId: string;
}

export class PayPalService implements ServiceContract {
  private httpClient: PayPalHttpClient;

  constructor(
    connData: PayPalServiceData,
    private paymentMethodRepo: PaymentMethodRepoContract,
    private invoiceRepo: InvoiceRepoContract,
    private paymentRepo: PaymentRepoContract,
    private logger: LoggerContract
  ) {
    this.httpClient = new checkoutNodeJsSDK.core.PayPalHttpClient(
      this.createEnvironment(connData)
    );

    this.attachExistingPayment = this.attachExistingPayment.bind(this);
    this.attachPayPalMethodId = this.attachPayPalMethodId.bind(this);
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
    const execution = await new AsyncEither(request)
      .then(this.attachOrderIdForExistingPayment)
      .advanceOrEnd(async (data) => right(!data.orderId))
      .then(this.createOrderInPayPal)
      .execute();

    return execution.map((data) => data.orderId);
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
    Either<
      Errors.UnsuccessfulOrderCapture | Errors.UnexpectedError,
      PaymentProof
    >
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

    return right(
      PaymentProof.create(
        response.result.purchase_units[0].payments.captures[0].id
      )
    );
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

  private async createOrderInPayPal(
    request: OrderRequest
  ): Promise<
    Either<
      Errors.UnsuccessfulOrderCreation | Errors.UnexpectedError,
      { orderId: ExternalOrderId }
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

    return right({ orderId: ExternalOrderId.create(response.result.id) });
  }

  private async attachOrderIdForExistingPayment<T extends WithInvoiceId>(
    request: T
  ): Promise<Either<UseCaseError, T & { orderId: ExternalOrderId }>> {
    const usecaseContext = {
      roles: [Roles.SERVICE],
    };

    return new AsyncEither(request)
      .then(this.attachPayPalMethodId(usecaseContext))
      .then(this.attachExistingPayment(usecaseContext))
      .map((data) => ({
        ...request,
        orderId: ExternalOrderId.create(data.payment.foreignPaymentId),
      }))
      .execute();
  }

  private attachExistingPayment(context: GetPaymentsByInvoiceIdContext) {
    const usecase = new GetPaymentsByInvoiceIdUsecase(
      this.invoiceRepo,
      this.paymentRepo
    );

    return async <T extends WithPaymentMethodId>(request: T) => {
      return new AsyncEither(request)
        .then(({ invoiceId }) => usecase.execute({ invoiceId }, context))
        .map((result) => result.getValue())
        .map((payments) =>
          payments.filter(
            (payment) =>
              payment.paymentMethodId.equals(request.paymentMethodId) &&
              payment.status === PaymentStatus.CREATED
          )
        )
        .map((payments) => ({
          ...request,
          payment: payments.length > 0 ? payments[0] : null,
        }))
        .execute();
    };
  }

  private attachPayPalMethodId(context: GetPaymentMethodByNameContext) {
    const usecase = new GetPaymentMethodByNameUsecase(this.paymentMethodRepo);

    return async <T>(request: T) => {
      return new AsyncEither({})
        .then(() => usecase.execute({ name: 'PayPal' }, context))
        .map((response) => response.getValue())
        .map((paymentMethod) => ({
          ...request,
          paymentMethodId: paymentMethod.paymentMethodId,
        }))
        .execute();
    };
  }
}
