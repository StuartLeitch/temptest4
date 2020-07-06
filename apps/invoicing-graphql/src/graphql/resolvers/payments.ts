/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { BraintreeGateway } from '../../../../../libs/shared/src/lib/modules/payments/infrastructure/gateways/braintree/gateway';
import {
  RecordBankTransferPaymentUsecase,
  PayPalPaymentApprovedUsecase,
  GenerateClientTokenUsecase,
  GetPaymentMethodsUseCase,
  MigratePaymentUsecase,
  RecordPaymentUsecase,
  PaymentMethodMap,
  CorrelationID,
  Roles,
} from '@hindawi/shared';

import { env } from '../../env';

import { Resolvers } from '../schema';
import { Context } from '../../builders';

export const payments: Resolvers<Context> = {
  Query: {
    async getPaymentMethods(parent, args, context) {
      const {
        repos: { paymentMethod: paymentMethodRepo },
        services: { logger: loggerService },
      } = context;
      const correlationId = new CorrelationID().toString();
      const usecase = new GetPaymentMethodsUseCase(
        paymentMethodRepo,
        loggerService
      );

      const result = await usecase.execute(null, {
        correlationId,
      });

      if (result.isRight()) {
        return result.value.getValue().map(PaymentMethodMap.toPersistence);
      } else {
        throw new Error(`Can't get payments methods.`);
      }
    },
    async getClientToken(parent, args, context) {
      const usecase = new GenerateClientTokenUsecase();

      const result = await usecase.execute({
        merchantAccountId: env.braintree.merchantAccountId,
      });

      if (result.isRight()) {
        const paymentClientToken = result.value.getValue();
        return paymentClientToken;
      } else {
        throw new Error(`Can't get client token.`);
      }
    },
  },
  Mutation: {
    async creditCardPayment(parent, args, context) {
      const {
        repos: {
          payment: paymentRepo,
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          manuscript: manuscriptRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
          payer: payerRepo,
        },
        services: { paymentStrategyFactory, logger },
      } = context;
      const { paymentMethodNonce, invoiceId } = args;

      const usecase = new RecordPaymentUsecase(
        paymentStrategyFactory,
        invoiceItemRepo,
        manuscriptRepo,
        paymentRepo,
        invoiceRepo,
        couponRepo,
        waiverRepo,
        payerRepo,
        logger
      );
      const usecaseContext = { roles: [Roles.PAYER] };

      const result = await usecase.execute(
        {
          payerIdentification: paymentMethodNonce,
          invoiceId,
        },
        usecaseContext
      );

      if (result.isLeft()) {
        console.log(result.value.message);
        return null;
      }

      const confirmedPayment = result.value;

      return {
        id: confirmedPayment.paymentId.id.toString(),
        invoiceId: confirmedPayment.invoiceId.id.toString(),
        paymentMethodId: confirmedPayment.paymentMethodId.id.toString(),
        foreignPaymentId: confirmedPayment.foreignPaymentId,
        amount: confirmedPayment.amount.value,
        datePaid: confirmedPayment.datePaid.toISOString(),
        status: confirmedPayment.status,
      };
    },

    async createPayPalOrder(parent, args, context) {
      const { invoiceId } = args;
      const usecaseContext = { roles: [Roles.PAYER] };
      const {
        repos: {
          payment: paymentRepo,
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          manuscript: manuscriptRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
          payer: payerRepo,
        },
        services: { paymentStrategyFactory, logger },
      } = context;

      const usecase = new RecordPaymentUsecase(
        paymentStrategyFactory,
        invoiceItemRepo,
        manuscriptRepo,
        paymentRepo,
        invoiceRepo,
        couponRepo,
        waiverRepo,
        payerRepo,
        logger
      );

      const result = await usecase.execute(
        {
          invoiceId,
        },
        usecaseContext
      );

      if (result.isLeft()) {
        console.log(result.value.message);
        return null;
      }

      const confirmedPayment = result.value;

      return {
        id: confirmedPayment.foreignPaymentId,
      };
    },

    async recordPayPalPayment(parent, args, context) {
      const { invoiceId, orderId } = args;

      const {
        repos: { payment: paymentRepo, invoice: invoiceRepo },
        services: { paymentStrategyFactory },
      } = context;

      const usecase = new PayPalPaymentApprovedUsecase(
        invoiceRepo,
        paymentRepo,
        paymentStrategyFactory
      );
      const usecaseContext = { roles: [Roles.PAYER] };
      try {
        const result = await usecase.execute(
          { invoiceId, payPalOrderId: orderId },
          usecaseContext
        );

        if (result.isLeft()) {
          throw result.value;
        }

        return invoiceId;
      } catch (e) {
        console.info(e);
        throw e;
      }
    },

    async migratePayment(parent, args, context) {
      const {
        repos: {
          paymentMethod: paymentMethodRepo,
          payment: paymentRepo,
          invoice: invoiceRepo,
        },
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
          datePaid,
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
        foreignPaymentId: migratedPayment.foreignPaymentId,
      };
    },

    async bankTransferPayment(parent, args, context) {
      const {
        repos: {
          payment: paymentRepo,
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          manuscript: manuscriptRepo,
        },
      } = context;
      const {
        invoiceId,
        payerId,
        paymentMethodId,
        paymentReference,
        amount,
        datePaid,
        markInvoiceAsPaid,
      } = args;

      const recordBankTransferPaymentUsecase = new RecordBankTransferPaymentUsecase(
        paymentRepo,
        invoiceRepo,
        manuscriptRepo,
        invoiceItemRepo
      );
      const usecaseContext = { roles: [Roles.PAYER] };

      const result = await recordBankTransferPaymentUsecase.execute(
        {
          invoiceId,
          payerId,
          paymentMethodId,
          paymentReference,
          amount,
          datePaid,
          markInvoiceAsPaid,
        },
        usecaseContext
      );

      if (result.isLeft()) {
        console.log(result.value.errorValue());
        return null;
      }

      const confirmedPayment = (result as any).value.getValue();

      return {
        id: confirmedPayment.paymentId.id.toString(),
        invoiceId: confirmedPayment.invoiceId.id.toString(),
        paymentMethodId: confirmedPayment.paymentMethodId.id.toString(),
        foreignPaymentId: confirmedPayment.foreignPaymentId,
        amount: confirmedPayment.amount.value,
        datePaid: confirmedPayment.datePaid.toISOString(),
        status: confirmedPayment.status,
      };
    },
  },
};
