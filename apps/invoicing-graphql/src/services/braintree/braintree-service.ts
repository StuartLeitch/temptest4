import {
  TransactionRequest,
  ValidatedResponse,
  BraintreeGateway,
  GatewayConfig,
  ClientToken,
  Environment,
  Transaction,
} from 'braintree';

import {
  BraintreeServiceContract as ServiceContract,
  BraintreeTransactionRequest as SaleRequest,
  BraintreeServiceErrors as Errors,
  PaymentClientToken,
  ExternalOrderId,
  LoggerContract,
  Either,
  right,
  left,
} from '@hindawi/shared';

interface ConnData {
  merchantAccountId: string;
  environment: string;
  merchantId: string;
  privateKey: string;
  publicKey: string;
}

class Service implements ServiceContract {
  private gateway: BraintreeGateway;
  private merchantAccountId: string;

  constructor(connData: ConnData, private logger: LoggerContract) {
    let envName = connData.environment.toLowerCase();
    envName = envName[0].toUpperCase() + envName.slice(1);

    const con: GatewayConfig = {
      ...connData,
      environment: Environment[envName],
    };

    this.merchantAccountId = connData.merchantAccountId;
    this.gateway = new BraintreeGateway(con);
  }

  async createTransaction({
    invoiceReferenceNumber,
    manuscriptCustomId,
    paymentMethodNonce,
    paymentTotal,
  }: SaleRequest): Promise<
    Either<Errors.UnsuccessfulSale | Errors.UnexpectedError, ExternalOrderId>
  > {
    const a: TransactionRequest = {
      paymentMethodNonce,
      merchantAccountId: this.merchantAccountId,
      amount: paymentTotal.toString(),
      orderId: invoiceReferenceNumber,
      options: {
        submitForSettlement: true,
      },
      customFields: {
        manuscript: manuscriptCustomId,
      },
    };

    let result: ValidatedResponse<Transaction>;

    try {
      result = await this.gateway.transaction.sale(a);
    } catch (e) {
      return left(new Errors.UnexpectedError(e));
    }

    if (!result.success) {
      this.logger.error(
        `Error on braintree transaction.sale, with message: ${result.message}`
      );
      return left(new Errors.UnsuccessfulSale(result.message));
    }

    return right(ExternalOrderId.create(result.transaction.id));
  }

  async generateClientToken(): Promise<
    Either<
      Errors.UnsuccessfulTokenGeneration | Errors.UnexpectedError,
      PaymentClientToken
    >
  > {
    let result: ValidatedResponse<ClientToken>;

    try {
      result = await this.gateway.clientToken.generate({
        merchantAccountId: this.merchantAccountId,
      });
    } catch (e) {
      return left(new Errors.UnexpectedError(e));
    }

    if (!result.success) {
      this.logger.error(
        `Error on braintree clientToken.generate, with message: ${result.message}`
      );
      return left(new Errors.UnsuccessfulTokenGeneration(result.message));
    }

    return right(PaymentClientToken.create(result.clientToken).getValue());
  }
}

export { ConnData as BraintreeConnectionData, Service as BraintreeService };
