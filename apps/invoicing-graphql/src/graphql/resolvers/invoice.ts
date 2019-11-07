import {
  GetInvoiceDetailsDTO,
  GetInvoiceDetailsUsecase,
  DeleteInvoiceUsecase,
  DeleteInvoiceRequestDTO,
  CreateInvoiceUsecase,
  CreateInvoiceRequestDTO,
  InvoiceMap,
  Invoice
} from '@hindawi/shared';

import {Resolvers} from '../schema';
import {Context} from '../../context';

export const invoice: Resolvers<Context> = {
  Query: {
    async invoice(parent, args, context) {
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
        const invoice = result.value.getValue();

        return {
          id: invoice.id.toString(),
          // totalAmount: entity.totalAmount,
          // netAmount: entity.netAmount
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

      const useCase = new CreateInvoiceUsecase(
        repos.invoice,
        repos.transaction
      );

      const request: CreateInvoiceRequestDTO = {
        transactionId: 'transaction-1'
      };

      const result = await useCase.execute(request);

      if (result.isLeft()) {
        const error = result.value;
        // TODO: Handle errors in this block
        return error;
      } else {
        const newInvoice = result.value.getValue();
        return InvoiceMap.toPersistence(newInvoice);
      }
    }
  }
};
