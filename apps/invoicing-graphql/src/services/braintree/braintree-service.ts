import {
  TransactionRequest,
  BraintreeGateway,
  GatewayConfig,
  Environment,
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
    Either<Errors.UnexpectedError | Errors.UnsuccessfulSale, ExternalOrderId>
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

    const res = await this.gateway.transaction.sale(a);
    if (!res.success) {
      this.logger.error(
        `Error on braintree transaction.sale, with message: ${res.message}`
      );
      return left(new Errors.UnsuccessfulSale(res.message));
    }

    return right(ExternalOrderId.create(res.transaction.id));
  }

  async generateClientToken(): Promise<
    Either<
      Errors.UnexpectedError | Errors.UnsuccessfulTokenGeneration,
      PaymentClientToken
    >
  > {
    // this.gateway.clientToken.generate();
    return null;
  }
}

export { ConnData as BraintreeConnectionData, Service as BraintreeService };
