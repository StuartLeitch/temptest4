import { GetPaymentMethodsUseCase } from '@hindawi/shared';

import { Resolvers } from '../schema';
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
    async creditCardPayment(parent, args, context) {
      const { checkoutService } = context;
      const { invoiceId, paymentMethodId, creditCard } = args;

      return Promise.resolve({
        id: '123',
        invoiceId: '345',
        payerId: '1231',
        paymentMethodId: '12312312',
        foreignPaymentId: '132131',
        paymentProof: '1231312',
        amount: 123.4,
        datePaid: new Date()
      });
    }
  }
};
