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
import { GetRecentInvoicesUsecase } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/getRecentInvoices/getRecentInvoices';

import { MigrateInvoiceUsecase } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/migrateInvoice/migrateInvoice';
import { GetInvoiceIdByManuscriptCustomIdUsecase } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomId';
import { GetInvoiceIdByManuscriptCustomIdDTO } from './../../../../../libs/shared/src/lib/modules/invoices/usecases/getInvoiceIdByManuscriptCustomId/getInvoiceIdByManuscriptCustomIdDTO';

import { Resolvers, Invoice, PayerType } from '../schema';
import { Context } from '../../context';

export const invoice: Resolvers<Context> = {
  Query: {
    async invoice(parent, args, context) {
      const { repos } = context;
      const usecase = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: args.invoiceId
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
          invoiceId: invoiceDetails.id.toString(),
          status: invoiceDetails.status,
          charge: invoiceDetails.charge,
          dateCreated: invoiceDetails.dateCreated.toISOString(),
          dateIssued:
            invoiceDetails.dateIssued &&
            invoiceDetails.dateIssued.toISOString(),
          referenceNumber:
            invoiceDetails.invoiceNumber && invoiceDetails.dateAccepted
              ? `${
                  invoiceDetails.invoiceNumber
                }/${invoiceDetails.dateAccepted.getFullYear()}`
              : '---'
          // totalAmount: entity.totalAmount,
          // netAmount: entity.netAmount
        };
      }
    },

    async invoices(parent, args, context) {
      const { repos } = context;
      const usecase = new GetRecentInvoicesUsecase(repos.invoice);
      const usecaseContext = {
        roles: [Roles.ADMIN]
      };
      const result = await usecase.execute(args, usecaseContext);

      if (result.isLeft()) {
        return undefined;
      }

      return result.value.getValue();
    },

    async invoiceIdByManuscriptCustomId(parent, args, context) {
      const {
        repos: { manuscript: articleRepo, invoiceItem: invoiceItemRepo }
      } = context;
      const usecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
        articleRepo,
        invoiceItemRepo
      );

      const request: GetInvoiceIdByManuscriptCustomIdDTO = {
        customId: args.customId
      };

      const usecaseContext = {
        roles: [Roles.ADMIN]
      };

      const result = await usecase.execute(request, usecaseContext);

      if (result.isLeft()) {
        return undefined;
      } else {
        // There is a TSLint error for when try to use a shadowed variable!
        const invoiceIds = result.value.getValue();

        return { invoiceId: invoiceIds.map(ii => ii.id.toString()) };
      }
    },

    async invoiceVat(parent, args, context) {
      const { repos, exchangeRateService, vatService } = context;
      const usecase = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: args.invoiceId
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

        let rate = 1.42; // ! Average value for the last seven years

        try {
          const exchangeRate = await exchangeRateService.getExchangeRate(
            new Date(invoiceDetails.dateIssued || invoiceDetails.dateCreated),
            'USD'
          );
          rate = exchangeRate.exchangeRate;
        } catch (error) {}

        const vatNote = vatService.getVATNote(
          args.country,
          args.payerType !== PayerType.INSTITUTION
        );
        const vatPercentage = vatService.calculateVAT(
          args.country,
          args.payerType !== PayerType.INSTITUTION
        );
        return {
          rate,
          vatNote: vatNote.template,
          vatPercentage
        };
      }
    }
  },
  Invoice: {
    async payer(parent: Invoice, args, context) {
      const {
        repos: { payer: payerRepo }
      } = context;
      const invoiceId = InvoiceId.create(
        new UniqueEntityID(parent.invoiceId)
      ).getValue();

      const payer = await payerRepo.getPayerByInvoiceId(invoiceId);

      if (!payer) {
        return null;
      }
      return PayerMap.toPersistence(payer);
    },
    async invoiceItem(parent: Invoice, args, context) {
      const {
        repos: {
          invoiceItem: invoiceItemRepo,
          invoice: invoiceRepo,
          payer: payerRepo,
          address: addressRepo
        },
        exchangeRateService,
        vatService
      } = context;

      const getItemsUseCase = new GetItemsForInvoiceUsecase(
        invoiceItemRepo,
        invoiceRepo
      );

      const result = await getItemsUseCase.execute({
        invoiceId: parent.invoiceId
      });

      if (result.isLeft()) {
        throw result.value.errorValue();
      }

      const [item] = result.value.getValue();
      const rawItem = InvoiceItemMap.toPersistence(item);

      let rate = 1.42; // ! Average value for the last seven years
      if (parent && parent.dateIssued) {
        const exchangeRate = await exchangeRateService.getExchangeRate(
          new Date(parent.dateIssued),
          'USD'
        );
        rate = exchangeRate.exchangeRate;
      }

      const invoiceId = InvoiceId.create(
        new UniqueEntityID(parent.invoiceId)
      ).getValue();

      const payer = await payerRepo.getPayerByInvoiceId(invoiceId);

      let vatnote = ' ';
      if (payer && payer.billingAddressId) {
        const address = await addressRepo.findById(payer.billingAddressId);
        // * Get the VAT note for the invoice item
        const { template } = vatService.getVATNote(
          address.country,
          payer.type !== PayerType.INSTITUTION
        );
        vatnote = template;
      }

      return { ...rawItem, rate: Math.round(rate * 100) / 100, vatnote };
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
  },
  Mutation: {
    async migrateInvoice(parent, args, context) {
      const {
        repos: { invoice: invoiceRepo, invoiceItem: invoiceItemRepo }
      } = context;
      const {
        invoiceId,
        vatValue,
        invoiceReference,
        discount,
        APC,
        dateIssued,
        dateAccepted
      } = args;

      const migrateInvoiceUsecase = new MigrateInvoiceUsecase(
        invoiceRepo,
        invoiceItemRepo
      );
      const usecaseContext = { roles: [Roles.PAYER] };

      const result = await migrateInvoiceUsecase.execute(
        {
          invoiceId,
          vatValue,
          invoiceReference: String(invoiceReference),
          discount,
          APC,
          dateIssued,
          dateAccepted
        },
        usecaseContext
      );

      if (result.isLeft()) {
        return null;
      }

      const migratedInvoice = result.value.getValue();

      return {
        invoiceId: migratedInvoice.invoiceId.id.toString(),
        referenceNumber: migratedInvoice.invoiceNumber,
        dateIssued: migratedInvoice.dateIssued.toISOString(),
        dateAccepted: migratedInvoice.dateAccepted.toISOString()
        // paymentMethodId: migratedPayment.paymentMethodId.id.toString(),
        // datePaid: migratedPayment.datePaid.toISOString(),
        // amount: migratedPayment.amount.value,
        // invoiceId: migratedPayment.invoiceId.id.toString(),
        // foreignPaymentId: migratedPayment.foreignPaymentId
      };
    }
  }
};
