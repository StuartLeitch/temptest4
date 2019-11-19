import {
  InvoiceId,
  PayerMap,
  ArticleMap,
  UniqueEntityID,
  InvoiceItemMap,
  GetInvoiceDetailsDTO,
  GetInvoiceDetailsUsecase,
  GetArticleDetailsUsecase,
  GetItemsForInvoiceUsecase,
  Roles
} from '@hindawi/shared';

import { Resolvers, Invoice } from '../schema';
import { Context } from '../../context';

export const invoice: Resolvers<Context> = {
  Query: {
    async invoice(parent, args, context) {
      const { repos } = context;
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
        // There is a TSLint error for when try to use a shadowed variable!
        const invoiceDetails = result.value.getValue();

        return {
          id: invoiceDetails.id.toString(),
          status: invoiceDetails.status,
          vat: invoiceDetails.vat,
          charge: invoiceDetails.charge,
          dateCreated: invoiceDetails.dateCreated.toISOString()
          // totalAmount: entity.totalAmount,
          // netAmount: entity.netAmount
        };
      }
    }
  },
  Invoice: {
    async payer(parent: Invoice, args, context) {
      const payer = await context.repos.payer.getPayerByInvoiceId(
        InvoiceId.create(new UniqueEntityID(parent.id)).getValue()
      );
      return PayerMap.toPersistence(payer);
    },
    async invoiceItems(parent: Invoice, args, context) {
      const getItemsUseCase = new GetItemsForInvoiceUsecase(
        context.repos.invoiceItem,
        context.repos.invoice
      );

      const items = await getItemsUseCase.execute({ invoiceId: parent.id });

      if (items.isLeft()) {
        throw items.value.errorValue();
      }

      return items.value.getValue().map(InvoiceItemMap.toPersistence);
    }
  },
  InvoiceItem: {
    async article(parent, args, context) {
      const getArticleUseCase = new GetArticleDetailsUsecase(
        context.repos.manuscript
      );

      const article = await getArticleUseCase.execute({
        articleId: parent.manuscriptId
      });

      if (article.isLeft()) {
        throw article.value.errorValue();
      }

      return ArticleMap.toPersistence(article.value.getValue());
    }
  }
};
