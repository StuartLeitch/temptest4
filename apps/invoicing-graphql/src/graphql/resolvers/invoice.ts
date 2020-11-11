/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import {
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetInvoiceIdByManuscriptCustomIdDTO,
  GetCreditNoteByInvoiceIdUsecase,
  ApplyCouponToInvoiceUsecase,
  GetPaymentMethodByIdUsecase,
  GetItemsForInvoiceUsecase,
  GetArticleDetailsUsecase,
  GetInvoiceDetailsUsecase,
  GetRecentInvoicesUsecase,
  CreateCreditNoteUsecase,
  GetInvoiceDetailsDTO,
  PaymentMethodMap,
  InvoiceItemMap,
  TransactionMap,
  UniqueEntityID,
  InvoiceItemId,
  ArticleMap,
  InvoiceMap,
  PaymentMap,
  CouponMap,
  InvoiceId,
  JournalId,
  WaiverMap,
  PayerMap,
  Roles,
} from '@hindawi/shared';

import { Resolvers, Invoice, PayerType } from '../schema';

import { Context } from '../../builders';

import { env } from '../../env';

export const invoice: Resolvers<Context> = {
  Query: {
    async invoice(parent, args, context) {
      const { repos } = context;
      const usecase = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: args.invoiceId,
      };

      const usecaseContext = {
        roles: [Roles.PAYER],
      };

      const result = await usecase.execute(request, usecaseContext);

      if (result.isLeft()) {
        const err = result.value.errorValue();
        context.services.logger.error(err.message, err);
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const invoiceDetails = result.value.getValue();

      return {
        invoiceId: invoiceDetails.id.toString(),
        status: invoiceDetails.status,
        charge: invoiceDetails.charge,
        dateCreated: invoiceDetails?.dateCreated?.toISOString(),
        dateAccepted: invoiceDetails?.dateAccepted?.toISOString(),
        dateMovedToFinal: invoiceDetails?.dateMovedToFinal?.toISOString(),
        erpReference: invoiceDetails.erpReference,
        revenueRecognitionReference: invoiceDetails.revenueRecognitionReference,
        cancelledInvoiceReference: invoiceDetails.cancelledInvoiceReference,
        dateIssued: invoiceDetails?.dateIssued?.toISOString(),
        referenceNumber:
          invoiceDetails.invoiceNumber && invoiceDetails.dateAccepted
            ? invoiceDetails.referenceNumber
            : '---',
        // totalAmount: entity.totalAmount,
        // netAmount: entity.netAmount
      };
    },

    async invoices(parent, args, context) {
      const { repos } = context;
      const usecase = new GetRecentInvoicesUsecase(repos.invoice);
      const usecaseContext = {
        roles: [Roles.ADMIN],
      };
      const result = await usecase.execute(args, usecaseContext);
      if (result.isLeft()) {
        return undefined;
      }

      const invoicesList = result.value.getValue();

      return {
        totalCount: invoicesList.totalCount,
        invoices: invoicesList.invoices.map((invoiceDetails) => ({
          ...InvoiceMap.toPersistence(invoiceDetails),
          invoiceId: invoiceDetails.id.toString(),
          // status: invoiceDetails.status,
          // charge: invoiceDetails.charge,
          dateCreated: invoiceDetails?.dateCreated?.toISOString(),
          dateAccepted: invoiceDetails?.dateAccepted?.toISOString(),
          dateIssued: invoiceDetails?.dateIssued?.toISOString(),
          referenceNumber:
            invoiceDetails.invoiceNumber && invoiceDetails.dateAccepted
              ? invoiceDetails.referenceNumber
              : null,
        })),
      };
    },

    async invoiceIdByManuscriptCustomId(parent, args, context) {
      const {
        repos: { manuscript: articleRepo, invoiceItem: invoiceItemRepo },
      } = context;
      const usecase = new GetInvoiceIdByManuscriptCustomIdUsecase(
        articleRepo,
        invoiceItemRepo
      );

      const request: GetInvoiceIdByManuscriptCustomIdDTO = {
        customId: args.customId,
      };

      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      const result = await usecase.execute(request, usecaseContext);

      if (result.isLeft()) {
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const invoiceIds = result.value.getValue();

      return { invoiceId: invoiceIds.map((ii) => ii.id.toString()) };
    },

    async invoiceVat(parent, args, context) {
      if (args.postalCode && !/^\d{5}$/.test(args.postalCode)) {
        throw new Error(
          `The postalCode {${args.postalCode}} is invalid, it needs to have 5 numbers.`
        );
      }
      const {
        repos,
        services: { exchangeRateService, vatService },
      } = context;
      const usecase = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: args.invoiceId,
      };
      const usecaseContext = {
        roles: [Roles.PAYER],
      };

      const result = await usecase.execute(request, usecaseContext);
      if (result.isLeft()) {
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const invoiceDetails = result.value.getValue();

      let rate = 1.42; // ! Average value for the last seven years

      try {
        const exchangeRate = await exchangeRateService.getExchangeRate(
          new Date(invoiceDetails.dateIssued || invoiceDetails.dateCreated),
          'USD'
        );
        if (exchangeRate?.exchangeRate) {
          rate = exchangeRate.exchangeRate;
        }
      } catch (error) {
        // do nothing yet
      }

      const vatNote = vatService.getVATNote(
        {
          postalCode: args.postalCode,
          countryCode: args.country,
          stateCode: args.state,
        },
        args.payerType !== PayerType.INSTITUTION
      );
      const vatPercentage = vatService.calculateVAT(
        {
          postalCode: args.postalCode,
          countryCode: args.country,
          stateCode: args.state,
        },
        args.payerType !== PayerType.INSTITUTION
      );
      return {
        rate,
        vatNote: vatNote.template,
        vatPercentage,
      };
    },
  },
  Invoice: {
    async payer(parent: Invoice, args, context) {
      const {
        repos: { payer: payerRepo },
      } = context;
      let invoiceId = InvoiceId.create(
        new UniqueEntityID(parent.invoiceId)
      ).getValue();

      let payer = await payerRepo.getPayerByInvoiceId(invoiceId);

      if (!payer) {
        if (parent.cancelledInvoiceReference) {
          invoiceId = InvoiceId.create(
            new UniqueEntityID(parent.cancelledInvoiceReference)
          ).getValue();
          payer = await payerRepo.getPayerByInvoiceId(invoiceId);
          if (!payer) {
            return null;
          }
        } else {
          return null;
        }
      }
      return PayerMap.toPersistence(payer);
    },
    async invoiceItem(parent: Invoice, args, context) {
      const {
        repos: {
          invoiceItem: invoiceItemRepo,
          coupon: couponRepo,
          payer: payerRepo,
          address: addressRepo,
          waiver: waiverRepo,
        },
        services: { exchangeRateService, vatService },
      } = context;

      const getItemsUseCase = new GetItemsForInvoiceUsecase(
        invoiceItemRepo,
        couponRepo,
        waiverRepo
      );

      const result = await getItemsUseCase.execute({
        invoiceId: parent.invoiceId,
      });

      let rawItem;
      if (result.isLeft()) {
        // throw result.value.errorValue();
        rawItem = null;
      } else {
        const [item] = result.value.getValue();
        rawItem = InvoiceItemMap.toPersistence(item);
      }

      let rate = 1.42; // ! Average value for the last seven years
      if (parent && parent.dateIssued) {
        try {
          const exchangeRate = await exchangeRateService.getExchangeRate(
            new Date(parent.dateIssued),
            'USD'
          );
          if (exchangeRate?.exchangeRate) {
            rate = exchangeRate?.exchangeRate;
          }
        } catch (error) {
          // do nothing yet
        }
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
          {
            postalCode: address.postalCode,
            countryCode: address.country,
            stateCode: address.state,
          },
          payer.type !== PayerType.INSTITUTION
        );
        vatnote = template;
      }

      // if (!rawItem) {
      //   return null;
      // }

      return { ...rawItem, rate: Math.round(rate * 10000) / 10000, vatnote };
    },
    async payment(parent: Invoice, args, context) {
      const {
        repos: { payment: paymentRepo },
      } = context;
      const invoiceId = InvoiceId.create(
        new UniqueEntityID(parent.invoiceId)
      ).getValue();

      const payment = await paymentRepo.getPaymentByInvoiceId(invoiceId);

      if (!payment) {
        return null;
      }
      return PaymentMap.toPersistence(payment);
    },
    async payments(parent: Invoice, args, context) {
      const {
        repos: { payment: paymentRepo },
      } = context;
      const invoiceId = InvoiceId.create(
        new UniqueEntityID(parent.invoiceId)
      ).getValue();

      const payments = await paymentRepo.getPaymentsByInvoiceId(invoiceId);

      if (!payments) {
        return null;
      }
      return payments.map((p) => PaymentMap.toPersistence(p));
    },
    async creditNote(parent: Invoice, args, context) {
      const {
        repos: { invoice: invoiceRepo },
      } = context;
      const usecase = new GetCreditNoteByInvoiceIdUsecase(invoiceRepo);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: parent.invoiceId,
      };

      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      const result = await usecase.execute(request, usecaseContext);

      if (result.isLeft()) {
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const creditNoteDetails = result.value.getValue();

      return {
        invoiceId: creditNoteDetails.id.toString(),
        cancelledInvoiceReference: creditNoteDetails.cancelledInvoiceReference,
        status: creditNoteDetails.status,
        charge: creditNoteDetails.charge,
        dateCreated: creditNoteDetails?.dateCreated?.toISOString(),
        erpReference: creditNoteDetails.erpReference,
        creditNoteReference: creditNoteDetails.creditNoteReference,
        revenueRecognitionReference:
          creditNoteDetails.revenueRecognitionReference,
        creationReason: creditNoteDetails.creationReason,
        dateIssued: creditNoteDetails?.dateIssued?.toISOString(),
        referenceNumber:
          creditNoteDetails.invoiceNumber && creditNoteDetails.dateAccepted
            ? `CN-${creditNoteDetails.referenceNumber}`
            : '---',
        // totalAmount: entity.totalAmount,
        // netAmount: entity.netAmount
      };
    },
    async transaction(parent: Invoice, args, context) {
      const {
        repos: { transaction: transactionRepo },
      } = context;
      const invoiceId = InvoiceId.create(
        new UniqueEntityID(parent.invoiceId)
      ).getValue();

      const transaction = await transactionRepo.getTransactionByInvoiceId(
        invoiceId
      );

      if (!transaction) {
        return null;
      }
      return TransactionMap.toPersistence(transaction);
    },
  },
  InvoiceItem: {
    async article(parent, args, context) {
      if (!parent) return null;

      const getArticleUseCase = new GetArticleDetailsUsecase(
        context.repos.manuscript
      );

      const article = await getArticleUseCase.execute({
        articleId: parent.manuscriptId,
      });

      if (article.isLeft()) {
        throw article.value.errorValue();
      }

      return ArticleMap.toPersistence(article.value.getValue());
    },

    async coupons(parent, args, context) {
      const coupons = await context.repos.coupon
        .getCouponsByInvoiceItemId(
          InvoiceItemId.create(new UniqueEntityID(parent.id))
        )
        .then((coupons) => coupons.map((c) => c.coupon));
      return coupons.map(CouponMap.toPersistence);
    },

    async waivers(parent, args, context) {
      const waivers = (
        await context.repos.waiver.getWaiversByInvoiceItemId(
          InvoiceItemId.create(new UniqueEntityID(parent.id))
        )
      ).waivers;
      return waivers.map(WaiverMap.toPersistence);
    },
  },
  Article: {
    async journalTitle(parent, args, context) {
      let catalogItem;

      try {
        catalogItem = await context.repos.catalog.getCatalogItemByJournalId(
          JournalId.create(new UniqueEntityID(parent.journalId)).getValue()
        );
      } catch (e) {
        return null;
      }

      return catalogItem?.journalTitle;
    },
  },
  Payment: {
    async paymentMethod(parent, args, context) {
      const getPaymentMethodUseCase = new GetPaymentMethodByIdUsecase(
        context.repos.paymentMethod
      );

      const paymentMethod = await getPaymentMethodUseCase.execute({
        paymentMethodId: parent.paymentMethodId,
      });

      if (paymentMethod.isLeft()) {
        throw paymentMethod.value.errorValue();
      }

      return PaymentMethodMap.toPersistence(paymentMethod.value.getValue());
    },
  },
  Mutation: {
    async applyCoupon(parent, args, context) {
      const {
        repos: {
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          coupon: couponRepo,
          transaction: transactionRepo,
          manuscript: manuscriptRepo,
          address: addressRepo,
          payer: payerRepo,
          waiver: waiverRepo,
        },
        services: { emailService, vatService, logger: loggerService },
      } = context;
      const {
        sanctionedCountryNotificationReceiver,
        sanctionedCountryNotificationSender,
      } = env.app;

      const applyCouponUsecase = new ApplyCouponToInvoiceUsecase(
        invoiceRepo,
        invoiceItemRepo,
        couponRepo,
        transactionRepo,
        manuscriptRepo,
        addressRepo,
        payerRepo,
        waiverRepo,
        emailService,
        vatService,
        loggerService
      );

      const result = await applyCouponUsecase.execute({
        couponCode: args.couponCode,
        invoiceId: args.invoiceId,
        sanctionedCountryNotificationReceiver,
        sanctionedCountryNotificationSender,
      });

      if (result.isLeft()) {
        throw new Error(result.value.errorValue().message);
      }

      return CouponMap.toPersistence(result.value.getValue());
    },
    async createCreditNote(parent, args, context): Promise<any> {
      const {
        repos: {
          // payment: paymentRepo,
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          transaction: transactionRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
          pausedReminder: pausedReminderRepo,
          // manuscript: manuscriptRepo,
        },
        services: { waiverService },
      } = context;

      console.info(args);

      const { invoiceId, createDraft, reason } = args;

      const createCreditNoteUsecase = new CreateCreditNoteUsecase(
        // paymentRepo,
        invoiceRepo,
        // manuscriptRepo,
        invoiceItemRepo,
        transactionRepo,
        couponRepo,
        waiverRepo,
        pausedReminderRepo,
        waiverService
      );
      const usecaseContext = { roles: [Roles.ADMIN] };

      const result = await createCreditNoteUsecase.execute(
        {
          invoiceId,
          createDraft,
          reason,
        },
        usecaseContext
      );

      if (result.isLeft()) {
        // console.log(result.value.errorValue());
        return null;
      }

      const creditNote = result.value.getValue();

      return {
        id: creditNote.invoiceId.id.toString(),
        cancelledInvoiceReference: creditNote.cancelledInvoiceReference,
        status: creditNote.status,
        charge: creditNote.charge,
        dateCreated: creditNote?.dateCreated?.toISOString(),
        erpReference: creditNote.erpReference,
        revenueRecognitionReference: creditNote.revenueRecognitionReference,
        creationReason: creditNote.creationReason,
        dateIssued: creditNote?.dateIssued?.toISOString(),
        referenceNumber:
          creditNote.invoiceNumber && creditNote.dateAccepted
            ? `CN-${creditNote.referenceNumber}`
            : '---',
      };
    },
  },
};
