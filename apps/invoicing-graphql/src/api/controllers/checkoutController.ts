import {Body, Get, JsonController, Post} from 'routing-controllers';

import {CheckoutService} from '../services/checkout';
import {RecordPayment} from '../../../../../libs/shared/src/lib/modules/payments/usecases/payment';

// import {makeDb} from '../../../../../libs/shared/src/lib/infrastructure/database/knex';
// import {KnexInvoiceRepo} from '../../../../../libs/shared/src/lib/modules/invoices/repos/implementations/knexInvoiceRepo';
// import {KnexPaymentRepo} from '../../../../../libs/shared/src/lib/modules/payments/repos/implementations/knexPaymentRepo';

import {MockPaymentRepo} from '../../../../../libs/shared/src/lib/modules/payments/repos/mocks/mockPaymentRepo';
import {MockInvoiceRepo} from '../../../../../libs/shared/src/lib/modules/invoices/repos/mocks/mockInvoiceRepo';

// @Authorized()
@JsonController('/checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Get()
  public hello(): Promise<any> {
    return Promise.resolve({hi: 'Hello World!'});
  }

  @Post()
  public async createCardPayment(@Body() payment: any): Promise<any> {
    const braintreePayment = await this.checkoutService.pay(payment);
    const useCase = new RecordPayment(
      new MockPaymentRepo(),
      new MockInvoiceRepo()
    );

    const payload = {
      amount: 100,
      payerId: '123-123-124',
      invoiceId: '123-123-125',
      foreignPaymentId: '123-123-126',
      paymentMethod: '123-123-1237'
    };

    try {
      return useCase.execute(payload);
    } catch (err) {
      return new Error('gherla');
    }
  }
}
