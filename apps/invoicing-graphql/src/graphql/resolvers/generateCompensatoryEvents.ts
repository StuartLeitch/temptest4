import { GenerateCompensatoryEventsUsecase } from '@hindawi/shared';

import { Resolvers } from '../schema';

import { env } from '../../env';

export const generateCompensatoryEvents: Resolvers<any> = {
  Mutation: {
    async generateCompensatoryEvents(parent, args, context) {
      const { invoiceIds, journalIds } = args;
      const {
        repos: {
          invoiceItem,
          manuscript,
          address,
          invoice,
          coupon,
          waiver,
          payer
        },
        qq: sqsQueService
      } = context;
      const usecase = new GenerateCompensatoryEventsUsecase(
        invoiceItem,
        sqsQueService,
        manuscript,
        address,
        invoice,
        coupon,
        waiver,
        payer
      );
      if (invoiceIds.length) {
        for (const invoiceId of invoiceIds) {
          const result = await usecase.execute({ invoiceId });
          if (result.isLeft()) {
            throw new Error(result.value.errorValue().message);
          }
        }
      }
      return 'ok';
    }
  }
};
