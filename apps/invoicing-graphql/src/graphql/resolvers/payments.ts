import { Roles, GetPaymentMethodsUseCase } from '@hindawi/shared';

import { Resolvers } from '../schema';
import { Context } from '../../context';

import { RecordPaymentUsecase } from './../../../../../libs/shared/src/lib/modules/payments/usecases/recordPayment/recordPayment';
import { MigratePaymentUsecase } from './../../../../../libs/shared/src/lib/modules/payments/usecases/migratePayment/migratePayment';

export const payments: Resolvers<Context> = {
  Query: {
    async getPaymentMethods(parent, args, context) {
      const usecase = new GetPaymentMethodsUseCase(context.repos.paymentMethod);

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
      const {
        checkoutService,
        repos: { payment: paymentRepo, invoice: invoiceRepo }
      } = context;
      const { invoiceId, payerId, paymentMethodId, creditCard } = args;

      const recordPaymentUsecase = new RecordPaymentUsecase(
        paymentRepo,
        invoiceRepo
      );
      const usecaseContext = { roles: [Roles.PAYER] };

      const result = await recordPaymentUsecase.execute(
        {
          paymentMethodId,
          invoiceId,
          amount: creditCard.amount,
          payerId
        },
        usecaseContext
      );

      // return {
      //   id: '123',
      //   invoiceId: '345',
      //   payerId: '1231',
      //   paymentMethodId: '12312312',
      //   foreignPaymentId: '132131',
      //   paymentProof: '1231312',
      //   amount: 123.4,
      //   datePaid: new Date()
      // };

      if (result.isLeft()) {
        return null;
      }

      const confirmedPayment = result.value.getValue();

      return {
        id: confirmedPayment.paymentId.id.toString(),
        invoiceId: confirmedPayment.invoiceId.id.toString(),
        paymentMethodId: confirmedPayment.paymentMethodId.id.toString(),
        foreignPaymentId: confirmedPayment.foreignPaymentId,
        amount: confirmedPayment.amount.value,
        datePaid: confirmedPayment.datePaid.toISOString()
      };
    },

    async migratePayment(parent, args, context) {
      const {
        checkoutService,
        repos: {
          paymentMethod: paymentMethodRepo,
          payment: paymentRepo,
          invoice: invoiceRepo
        }
      } = context;
      const { invoiceId, payerId, amount, datePaid } = args;

      const migratePaymentUsecase = new MigratePaymentUsecase(
        paymentMethodRepo,
        paymentRepo,
        invoiceRepo
      );
      const usecaseContext = { roles: [Roles.PAYER] };

      const result = await migratePaymentUsecase.execute(
        {
          invoiceId,
          payerId,
          amount,
          datePaid
        },
        usecaseContext
      );

      if (result.isLeft()) {
        return null;
      }

      const migratedPayment = result.value.getValue();

      return {
        id: migratedPayment.paymentId.id.toString(),
        payerId: migratedPayment.payerId.id.toString(),
        paymentMethodId: migratedPayment.paymentMethodId.id.toString(),
        datePaid: migratedPayment.datePaid.toISOString(),
        amount: migratedPayment.amount.value,
        invoiceId: migratedPayment.invoiceId.id.toString(),
        foreignPaymentId: migratedPayment.foreignPaymentId
      };
    }
  }
};
