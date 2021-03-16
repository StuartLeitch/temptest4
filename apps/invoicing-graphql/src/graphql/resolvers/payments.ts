/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  PayPalPaymentApprovedUsecase,
  GenerateClientTokenUsecase,
  GetPaymentMethodsUseCase,
  RecordPaymentUsecase,
  PaymentMethodMap,
  CorrelationID,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

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
      const {
        services: { paymentStrategyFactory, logger },
      } = context;
      const usecase = new GenerateClientTokenUsecase(paymentStrategyFactory);

      const result = await usecase.execute();

      if (result.isRight()) {
        const paymentClientToken = result.value;
        return paymentClientToken;
      } else {
        const err = result.value;
        logger.error(
          `While getting the braintree client token an error ocurred {${err.message}}`,
          err
        );
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
          datePaid: new Date().toISOString(),
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
        foreignPaymentId: confirmedPayment.foreignPaymentId.toString(),
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
          datePaid: new Date().toISOString(),
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
        id: confirmedPayment.foreignPaymentId.toString(),
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

    async bankTransferPayment(parent, args, context) {
      const {
        repos: {
          invoiceItem: invoiceItemRepo,
          manuscript: manuscriptRepo,
          invoice: invoiceRepo,
          payment: paymentRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
          payer: payerRepo,
        },
        services: { paymentStrategyFactory, logger },
      } = context;
      const {
        markInvoiceAsPaid,
        paymentReference,
        invoiceId,
        datePaid,
        amount,
      } = args;

      const usecaseContext = { roles: [Roles.PAYER] };
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
          isFinalPayment: markInvoiceAsPaid,
          paymentReference,
          invoiceId,
          datePaid,
          amount,
        },
        usecaseContext
      );

      if (result.isLeft()) {
        console.log(result.value);
        throw result.value;
      }

      const confirmedPayment = result.value;

      return {
        paymentMethodId: confirmedPayment.paymentMethodId.id.toString(),
        invoiceId: confirmedPayment.invoiceId.id.toString(),
        foreignPaymentId: confirmedPayment.foreignPaymentId.toString(),
        datePaid: confirmedPayment.datePaid.toISOString(),
        id: confirmedPayment.paymentId.id.toString(),
        amount: confirmedPayment.amount.value,
        status: confirmedPayment.status,
      };
    },
  },
};
