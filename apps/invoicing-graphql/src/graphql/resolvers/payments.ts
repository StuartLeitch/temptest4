import { Resolvers, Payment } from '../schema';
import { Context } from '../../context';

export const payments: Resolvers<Context> = {
  Query: {
    async getPaymentMethods(parent, args, context) {
      console.log('get the payment methods');
      return Promise.resolve([{ id: '123', name: 'Paypal', active: false }]);
    }
  },
  Mutation: {
    async recordCardPayment(parent, args, context) {
      console.log('record the card payment', args);

      return Promise.resolve({
        id: '123',
        invoiceId: '234',
        paymentMethodId: '12341',
        amount: 123.3
      });
    }
  }
};
