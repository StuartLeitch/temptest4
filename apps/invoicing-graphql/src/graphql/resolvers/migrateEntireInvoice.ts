import {
  MigrateEntireInvoiceUsecase,
  MigrateEntireInvoiceDTO,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';
import { env } from '../../env';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const migrateEntireInvoice: Resolvers<Context> = {
  Mutation: {
    async migrateEntireInvoice(parent, args, context) {
      const roles = getAuthRoles(context);
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
        roles,
      };

      try {
        const maybeResult = await migrateUsecase.execute(
          usecaseRequest,
          usecaseContext
        );

        handleForbiddenUsecase(maybeResult);

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
