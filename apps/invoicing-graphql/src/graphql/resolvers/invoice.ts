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

      if (!result.value.isSuccess) {
        return undefined;
      }

      const invoice = result.value.getValue();

      return {
        id: invoice.id.toString(),
        invoice
        // totalAmount: invoice.totalAmount,
        // netAmount: invoice.netAmount
      };
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

      const result = await usecase.execute(request);

      return InvoiceMap.toPersistence(result.getValue());
    }
  }
};
