import { GetPaymentMethodsUseCase } from '@hindawi/shared';

import { Resolvers, Payment } from '../schema';
import { Context } from '../../context';

export const payments: Resolvers<Context> = {
  Query: {
    async getPaymentMethods(parent, args, context) {
      const usecase = new GetPaymentMethodsUseCase(
        context.repos.paymentMethods
      );

      const result = await usecase.execute();

      if (result.isRight()) {
        return result.value.getValue();
      } else {
        throw new Error(`Can't get payments methods.`);
      }
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
