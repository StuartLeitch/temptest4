/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  GenerateCompensatoryEventsUsecase,
  GetInvoicesIdsUsecase,
  Roles,
} from '@hindawi/shared';

import { Resolvers } from '../schema';

export const generateCompensatoryEvents: Resolvers<any> = {
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
        services: { logger: loggerService },
        qq: sqsQueService,
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
      });

      if (maybeResult.isLeft()) {
        throw new Error(maybeResult.value.errorValue().message);
      }
      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      const ids = maybeResult.value.getValue();

      for await (const invoiceId of ids) {
        const result = await usecase.execute({ invoiceId }, usecaseContext);
        if (result.isLeft()) {
          throw new Error(result.value.errorValue().message);
        }
      }

      return 'ok';
    },
  },
};
