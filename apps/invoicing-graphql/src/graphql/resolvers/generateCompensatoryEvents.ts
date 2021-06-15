/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {
  GenerateCompensatoryEventsUsecase,
  GetInvoicesIdsUsecase,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../builders';

import { Resolvers } from '../schema';

export const generateCompensatoryEvents: Resolvers<Context> = {
  Mutation: {
    async generateCompensatoryEvents(parent, args, context) {
      const { invoiceIds, journalIds } = args;
      const {
        repos: {
          paymentMethod,
          invoiceItem,
          manuscript,
          address,
          invoice,
          coupon,
          waiver,
          payer,
          payment,
        },
        services: { logger: loggerService, qq: sqsQueService },
      } = context;
      const usecase = new GenerateCompensatoryEventsUsecase(
        paymentMethod,
        invoiceItem,
        sqsQueService,
        manuscript,
        address,
        invoice,
        payment,
        coupon,
        waiver,
        payer,
        loggerService
      );
      const getIdsUsecase = new GetInvoicesIdsUsecase(invoice);
      const maybeResult = await getIdsUsecase.execute({
        invoiceIds,
        journalIds,
        omitDeleted: true,
      });

      if (maybeResult.isLeft()) {
        throw new Error(maybeResult.value.message);
      }
      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      const ids = maybeResult.value;

      const errors = [];

      for await (const invoiceId of ids) {
        const result = await usecase.execute({ invoiceId }, usecaseContext);
        if (result.isLeft()) {
          errors.push(result.value);
        }
      }

      if (errors.length) {
        console.error(errors);
        loggerService.error('Errors have ocurred', ...errors);
        throw errors;
      }

      console.log('finish regeneration');
      loggerService.debug('Finish Regeneration');
      return 'ok';
    },
  },
};
