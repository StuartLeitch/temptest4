import {
  GetInvoiceDetailsDTO,
  GetInvoiceDetailsUsecase,
  DeleteInvoiceUsecase,
  DeleteInvoiceRequestDTO,
  CreateInvoiceUsecase,
  CreateInvoiceRequestDTO,
  InvoiceMap
} from '@hindawi/shared';

import {Resolvers} from '../schema';
import {Context} from '../../context';

export const invoice: Resolvers<Context> = {
  Query: {
    async invoice(parent, args, context, info) {
      const {repos, vatService, waiverService} = context;
      const usecase = new GetInvoiceDetailsUsecase(
        repos.invoice,
        repos.waiver,
        vatService,
        waiverService
      );

      const request: GetInvoiceDetailsDTO = {
        invoiceId: args.id
      };

      const result = await usecase.execute(request);

      if (result.isLeft()) {
        return undefined;
      } else {
        const resolvedInvoice = result.value.getValue();
        return {
          ...resolvedInvoice,
          id: resolvedInvoice.id.toString()
          // totalAmount: invoice.totalAmount,
          // netAmount: invoice.netAmount
        };
      }
    }
  },

  Mutation: {
    async deleteInvoice(parent, args, context) {
      const {repos} = context;
      const usecase = new DeleteInvoiceUsecase(repos.invoice);

      const request: DeleteInvoiceRequestDTO = {
        invoiceId: args.id
      };

      const result = await usecase.execute(request);

      return result.isSuccess;
    },

    async createInvoice(parent, args, context) {
      const {repos} = context;
      const usecase = new CreateInvoiceUsecase(
        repos.invoice,
        repos.transaction
      );

      const request: CreateInvoiceRequestDTO = {
        transactionId: 'transaction-1'
      };

      try {
        const result = await this.useCase.execute(request);

        if (result.isLeft()) {
          const error = result.value;
          // TODO: Handle errors in this block
        } else {
          return result.value.getValue();
        }
      } catch (err) {
        // TODO: Also handle errors in here
      }
    }
  }
};
