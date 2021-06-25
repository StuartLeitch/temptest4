import {
  GenerateDraftCompensatoryEventsUsecase,
  GetInvoicesIdsUsecase,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const generateDraftCompensatoryEvents: Resolvers<Context> = {
  Mutation: {
    async generateDraftCompensatoryEvents(parent, args, context) {
      const roles = getAuthRoles(context);
      const { invoiceIds, journalIds } = args;
      const {
        repos: { invoiceItem, manuscript, invoice, coupon, waiver },
        services: { logger: loggerService, qq: sqsQueService },
      } = context;
      const usecase = new GenerateDraftCompensatoryEventsUsecase(
        invoiceItem,
        manuscript,
        invoice,
        coupon,
        waiver,
        sqsQueService,
        loggerService
      );
      const getIdsUsecase = new GetInvoicesIdsUsecase(invoice);
      const maybeResult = await getIdsUsecase.execute({
        invoiceIds,
        journalIds,
        omitDeleted: false,
      });

      if (maybeResult.isLeft()) {
        throw new Error(maybeResult.value.message);
      }
      const usecaseContext = {
        roles,
      };

      const ids = maybeResult.value;

      const errors = [];

      for await (const invoiceId of ids) {
        const result = await usecase.execute({ invoiceId }, usecaseContext);

        handleForbiddenUsecase(result);

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
