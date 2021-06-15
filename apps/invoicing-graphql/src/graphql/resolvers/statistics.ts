import format from 'date-fns/format';
import { Context } from '../../builders';
import { Resolvers } from '../schema';

export const statistics: Resolvers<Context> = {
  Query: {
    async countInvoices(parent, args, context) {
      const {
        repos: { invoice: invoicesRepo },
        services: { logger: loggerService },
      } = context;

      const draftInvoices = await invoicesRepo.countInvoices({
        status: 'DRAFT',
        range: {
          from: format(new Date(args.filters.from), 'yyyy-MM-dd'),
          to: format(
            args.filters?.to ? new Date(args.filters?.to) : new Date(),
            'yyyy-MM-dd'
          ),
        },
      });

      return {
        draftInvoicesCount: draftInvoices,
      };
    },
  },
};
