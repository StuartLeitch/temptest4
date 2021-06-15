/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  MigrateEntireInvoiceUsecase,
  MigrateEntireInvoiceDTO,
  Roles,
} from '@hindawi/shared';

import { Resolvers } from '../schema';

import { Context } from '../../builders';

import { env } from '../../env';

export const migrateEntireInvoice: Resolvers<Context> = {
  Mutation: {
    async migrateEntireInvoice(parent, args, context) {
      const {
        repos: {
          paymentMethod,
          invoiceItem,
          transaction,
          manuscript,
          address,
          invoice,
          payment,
          coupon,
          waiver,
          payer,
        },
        services: { logger: loggerService, qq: sqsQueService },
      } = context;

      const migrateUsecase = new MigrateEntireInvoiceUsecase(
        paymentMethod,
        sqsQueService,
        invoiceItem,
        transaction,
        manuscript,
        address,
        invoice,
        payment,
        coupon,
        waiver,
        payer,
        loggerService
      );

      const usecaseRequest: MigrateEntireInvoiceDTO = {
        acceptanceDate: args.acceptanceDate,
        submissionDate: args.submissionDate,
        paymentDate: args.paymentDate,
        issueDate: args.issueDate,
        revenueRecognitionReference: args.revenueRecognitionReference,
        erpReference: args.erpReference,
        invoiceId: args.invoiceId,
        status: args.status,
        payer: args.payer,
        apc: args.apc,
      };

      if (args.token !== env.migration.token) {
        console.log('invalid token');
        return null;
      }

      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      try {
        const maybeResult = await migrateUsecase.execute(
          usecaseRequest,
          usecaseContext
        );

        if (maybeResult.isLeft()) {
          console.log(maybeResult.value);
          throw new Error(maybeResult.value.message);
        }
      } catch (err) {
        console.info(err);
        throw err;
      }

      return 'migration ok';
    },
  },
};
