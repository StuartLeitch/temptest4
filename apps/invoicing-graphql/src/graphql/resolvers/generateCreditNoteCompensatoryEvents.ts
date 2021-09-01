import {
  GenerateCreditNoteCompensatoryEventsUsecase,
  GetCreditNoteIdsUsecase,
} from '@hindawi/shared';

import { Context } from '../../builders';
import { Resolvers } from '../schema';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const generateCreditNoteCompensatoryEvents: Resolvers<Context> = {
  Mutation: {
    async generateCreditNoteCompensatoryEvents(parent, args, context) {
      const roles = getAuthRoles(context);
      const { creditNoteIds, journalIds } = args;
      const {
        repos: {
          paymentMethod,
          invoiceItem,
          manuscript,
          address,
          invoice,
          creditNote,
          coupon,
          waiver,
          payer,
          payment,
        },
        services: { logger: loggerService, qq: sqsQueService },
      } = context;

      const usecaseContext = {
        roles,
      };

      const usecase = new GenerateCreditNoteCompensatoryEventsUsecase(
        paymentMethod,
        invoiceItem,
        creditNote,
        manuscript,
        address,
        invoice,
        payment,
        coupon,
        waiver,
        payer,
        sqsQueService,
        loggerService
      );
      const getIdsUsecase = new GetCreditNoteIdsUsecase(creditNote);
      const maybeResult = await getIdsUsecase.execute(
        {
          creditNoteIds,
          journalIds,
          omitDeleted: true,
        },
        usecaseContext
      );

      if (maybeResult.isLeft()) {
        throw new Error(maybeResult.value.message);
      }

      const ids = maybeResult.value;

      const errors = [];

      for await (const creditNoteId of ids) {
        const result = await usecase.execute({ creditNoteId }, usecaseContext);

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
