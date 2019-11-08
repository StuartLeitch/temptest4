import {
  GetInvoiceDetailsDTO,
  GetInvoiceDetailsUsecase,
  InvoiceMap,
  Roles,
  Invoice
} from '@hindawi/shared';

import {Resolvers} from '../schema';
import {Context} from '../../context';

export const invoice: Resolvers<Context> = {
  Query: {
    async invoice(parent, args, context) {
      const {repos} = context;
      const usecase = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: args.id
      };

      const usecaseContext = {
        roles: [Roles.PAYER]
      };

      const result = await usecase.execute(request, usecaseContext);

      if (result.isLeft()) {
        return undefined;
      } else {
        const invoice = result.value.getValue();

        return {
          id: invoice.id.toString(),
          status: invoice.status,
          vat: invoice.vat,
          charge: invoice.charge,
          dateCreated: invoice.dateCreated.toISOString(),
          // totalAmount: entity.totalAmount,
          // netAmount: entity.netAmount
        };
      }
    }
  }
};
