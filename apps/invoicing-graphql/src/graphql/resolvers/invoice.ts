import {
  PayerMap,
  InvoiceId,
  JournalId,
  ArticleMap,
  UniqueEntityID,
  InvoiceItemMap,
  GetInvoiceDetailsDTO,
  GetInvoiceDetailsUsecase,
  GetArticleDetailsUsecase,
  GetItemsForInvoiceUsecase,
  Roles
} from '@hindawi/shared';

import EmailTemplate from '@pubsweet/component-email-templating';

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

      // const email = new EmailTemplate({
      //   type: 'user',
      //   fromEmail: 'aurel@hindawi.com',
      //   toUser: {
      //     email: 'alexandru.munt@gmail.com',
      //     name: 'hai sa vedem'
      //   },
      //   content: {
      //     ctaText: 'MANUSCRIPT DETAILS',
      //     signatureJournal: 'ABC jurnal',
      //     signatureName: `Costel Costelovici`,
      //     subject: `un-id: Manuscript Update`,
      //     paragraph: 'bine ati venit!',
      //     unsubscribeLink: `http://localhost:3000/unsubscribe/123`,
      //     ctaLink: `http://localhost:3000/projects/123/versions/123/details`
      //   },
      //   bodyProps: {
      //     hasLink: true,
      //     hasIntro: true,
      //     hasSignature: true
      //   }
      // });

      // email.sendEmail();

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
          dateCreated: invoiceDetails.dateCreated.toISOString(),
          referenceNumber: invoiceDetails.invoiceNumber
            ? `${
                invoiceDetails.invoiceNumber
              }/${invoiceDetails.dateCreated.getFullYear()}`
            : '---'
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
    async invoiceItem(parent: Invoice, args, context) {
      const getItemsUseCase = new GetItemsForInvoiceUsecase(
        context.repos.invoiceItem,
        context.repos.invoice
      );

      const item = await getItemsUseCase.execute({ invoiceId: parent.id });

      if (item.isLeft()) {
        throw item.value.errorValue();
      }

      return InvoiceItemMap.toPersistence(item.value.getValue()[0]);
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
  },
  Article: {
    async journalTitle(parent, args, context) {
      const catalogItem = await context.repos.catalog.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(parent.journalId)).getValue()
      );

      return catalogItem.journalTitle;
    }
  }
};
