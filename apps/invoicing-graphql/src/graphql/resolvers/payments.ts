import { Roles, GetPaymentMethodsUseCase } from '@hindawi/shared';

import { Resolvers } from '../schema';

import { MigratePaymentUsecase } from './../../../../../libs/shared/src/lib/modules/payments/usecases/migratePayment/migratePayment';
import {
  RecordCreditCardPaymentUsecase,
  RecordPayPalPaymentUsecase
} from '@hindawi/shared';
import { GenerateClientTokenUsecase } from './../../../../../libs/shared/src/lib/modules/payments/usecases/generateClientToken/generateClientToken';

export const payments: Resolvers<any> = {
  Query: {
    async getPaymentMethods(parent, args, context) {
      const usecase = new GetPaymentMethodsUseCase(context.repos.paymentMethod);

      const result = await usecase.execute();

      if (result.isRight()) {
        return result.value.getValue();
      } else {
        throw new Error(`Can't get payments methods.`);
      }
    },
    async getClientToken(parent, args, context) {
      const usecase = new GenerateClientTokenUsecase();

      const result = await usecase.execute({});

      if (result.isRight()) {
        const paymentClientToken = result.value.getValue();
        return paymentClientToken;
      } else {
        throw new Error(`Can't get client token.`);
      }
    }
  },
  Mutation: {
    async creditCardPayment(parent, args, context) {
      const {
        checkoutService,
        repos: { payment: paymentRepo, invoice: invoiceRepo }
      } = context;
      const {
        invoiceId,
        payerId,
        paymentMethodId,
        paymentMethodNonce,
        amount
      } = args;

      const recordCreditCardPaymentUsecase = new RecordCreditCardPaymentUsecase(
        paymentRepo,
        invoiceRepo
      );
      const usecaseContext = { roles: [Roles.PAYER] };

      const result = await recordCreditCardPaymentUsecase.execute(
        {
          paymentMethodId,
          paymentMethodNonce,
          invoiceId,
          amount,
          payerId
        },
        usecaseContext
      );

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

    async recordPayPalPayment(parent, args, context) {
      const { invoiceId, payerId, orderId, paymentMethodId } = args;
      const usecaseContext = { roles: [Roles.PAYER] };
      const {
        payPalService,
        repos: { invoice: invoiceRepo, payment: paymentRepo }
      } = context;

      const usecase = new RecordPayPalPaymentUsecase(
        paymentRepo,
        invoiceRepo,
        payPalService
      );

      const result = await usecase.execute(
        {
          invoiceId,
          payerId,
          orderId,
          paymentMethodId
        },
        usecaseContext
      );

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
