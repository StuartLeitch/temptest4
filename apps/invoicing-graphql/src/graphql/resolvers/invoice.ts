import {
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetInvoiceIdByManuscriptCustomIdDTO,
  GetTransactionByInvoiceIdUsecase,
  GetCreditNoteByInvoiceIdUsecase,
  GetPaymentsByInvoiceIdUsecase,
  ApplyCouponToInvoiceUsecase,
  GetPaymentMethodByIdUsecase,
  GetItemsForInvoiceUsecase,
  GetArticleDetailsUsecase,
  GetInvoiceDetailsUsecase,
  GetRecentInvoicesUsecase,
  CreateCreditNoteUsecase,
  GetInvoiceDetailsDTO,
  GetVATNoteUsecase,
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

import { InvoiceStatus, PayerType, Resolvers, Invoice } from '../schema';
import { Context } from '../../builders';
import { env } from '../../env';

import {
  handleForbiddenUsecase,
  getOptionalAuthRoles,
  getAuthRoles,
} from './utils';

export const invoice: Resolvers<Context> = {
  Query: {
    async invoice(parent, args, context): Promise<any> {
      const { repos } = context;

      const getCreditNoteByInvoiceIdUsecase = new GetInvoiceDetailsUsecase(
        repos.invoice
      );
      const usecase = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: args.invoiceId,
      };

      const usecaseContext = {
        roles: [Roles.PAYER],
      };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        const err = result.value;
        context.services.logger.error(err.message, err);
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const invoiceDetails = result.value;

      let assocInvoice = null;
      // * this is a credit note, let's ask for the reference number of the associated invoice
      if (invoiceDetails.cancelledInvoiceReference) {
        const result = await getCreditNoteByInvoiceIdUsecase.execute(
          { invoiceId: invoiceDetails.cancelledInvoiceReference },
          usecaseContext
        );

        if (result.isLeft()) {
          return undefined;
        }
        const invoice = result.value;
        assocInvoice = InvoiceMap.toPersistence(invoice);
      }
      const maybePayments = await repos.payment.getPaymentsByInvoiceId(
        invoiceDetails.invoiceId
      );

      if (maybePayments.isLeft()) {
        throw maybePayments.value;
      }

      const payments = maybePayments.value;

      const paymentsIds = payments.map((p) => p.id);

      const maybeErpPaymentReferences = await repos.erpReference.getErpReferencesById(
        paymentsIds
      );

      if (maybeErpPaymentReferences.isLeft()) {
        throw maybeErpPaymentReferences.value;
      }

      const erpPaymentReferences = maybeErpPaymentReferences.value;

      return {
        invoiceId: invoiceDetails.id.toString(),
        status: invoiceDetails.status,
        dateCreated: invoiceDetails?.dateCreated?.toISOString(),
        dateAccepted: invoiceDetails?.dateAccepted?.toISOString(),
        dateMovedToFinal: invoiceDetails?.dateMovedToFinal?.toISOString(),
        erpReferences: invoiceDetails
          .getErpReferences()
          .getItems()
          .concat(erpPaymentReferences),
        cancelledInvoiceReference: invoiceDetails.cancelledInvoiceReference,
        dateIssued: invoiceDetails?.dateIssued?.toISOString(),
        referenceNumber: assocInvoice
          ? assocInvoice.persistentReferenceNumber
          : invoiceDetails.persistentReferenceNumber,
      };
    },

    async invoices(parent, args, context) {
      const contextRoles = getAuthRoles(context);

      const { repos } = context;
      const getCreditNoteByInvoiceIdUsecase = new GetInvoiceDetailsUsecase(
        repos.invoice
      );
      const usecase = new GetRecentInvoicesUsecase(repos.invoice);
      const usecaseContext = {
        roles: contextRoles,
      };
      const result = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        return undefined;
      }

      const invoicesList = result.value;

      const retrieveAssociatedInvoice = async (item: any) => {
        const result = await getCreditNoteByInvoiceIdUsecase.execute(
          { invoiceId: item.cancelledInvoiceReference },
          usecaseContext
        );
        if (result.isLeft()) {
          return undefined;
        }
        const invoice = result.value;
        return InvoiceMap.toPersistence(invoice);
      };

      const getInvoices = async () =>
        Promise.all(
          invoicesList.invoices.map(async (invoiceDetails: any) => {
            let assocInvoice = null;
            if (invoiceDetails.cancelledInvoiceReference) {
              // * this is a credit note, let's ask for the reference number of the associated invoice
              assocInvoice = await retrieveAssociatedInvoice(invoiceDetails);
            }

            return {
              ...InvoiceMap.toPersistence(invoiceDetails),
              invoiceId: invoiceDetails.id.toString(),
              dateCreated: invoiceDetails?.dateCreated?.toISOString(),
              dateAccepted: invoiceDetails?.dateAccepted?.toISOString(),
              dateIssued: invoiceDetails?.dateIssued?.toISOString(),
              referenceNumber: assocInvoice
                ? assocInvoice.persistentReferenceNumber
                : invoiceDetails.persistentReferenceNumber,
            };
          })
        );

      return {
        totalCount: invoicesList.totalCount,
        invoices: await getInvoices(),
      };
    },

    async invoiceIdByManuscriptCustomId(parent, args, context) {
      const roles = getAuthRoles(context);
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
        roles,
      };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const invoiceIds = result.value;

      return { invoiceId: invoiceIds.map((ii) => ii.id.toString()) };
    },

    async invoiceVat(parent, args, context) {
      if (args.postalCode && !/^\d{5}$/.test(args.postalCode)) {
        throw new Error(
          `The postalCode {${args.postalCode}} is invalid, it needs to have 5 numbers.`
        );
      }

      const roles = getOptionalAuthRoles(context);

      const {
        repos,
        services: { exchangeRateService, vatService },
      } = context;
      const usecase = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: args.invoiceId,
      };
      const usecaseContext = {
        roles,
      };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const invoiceDetails = result.value;

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
        args.payerType !== PayerType.INSTITUTION,
        invoiceDetails.dateIssued
      );
      const vatPercentage = vatService.calculateVAT(
        {
          postalCode: args.postalCode,
          countryCode: args.country,
          stateCode: args.state,
        },
        args.payerType !== PayerType.INSTITUTION,
        invoiceDetails.dateIssued
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
      if (parent.status === InvoiceStatus.DRAFT) {
        return null;
      }
      const {
        repos: { payer: payerRepo },
      } = context;
      let invoiceId = InvoiceId.create(new UniqueEntityID(parent.invoiceId));

      let maybePayer = await payerRepo.getPayerByInvoiceId(invoiceId);

      if (maybePayer.isLeft()) {
        if (parent.cancelledInvoiceReference) {
          invoiceId = InvoiceId.create(
            new UniqueEntityID(parent.cancelledInvoiceReference)
          );
          maybePayer = await payerRepo.getPayerByInvoiceId(invoiceId);
          if (maybePayer.isLeft()) {
            // throw new Error(maybePayer.value.message);
            return null;
          }
        } else {
          return null;
        }
      }
      return PayerMap.toPersistence(maybePayer.value);
    },
    async invoiceItem(parent: Invoice, args, context) {
      const roles = getOptionalAuthRoles(context);

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

      const usecaseContext = {
        roles,
      };

      const getItemsUseCase = new GetItemsForInvoiceUsecase(
        invoiceItemRepo,
        couponRepo,
        waiverRepo
      );

      const result = await getItemsUseCase.execute(
        {
          invoiceId: parent.invoiceId,
        },
        usecaseContext
      );

      let rawItem;
      if (result.isLeft()) {
        rawItem = null;
      } else {
        const [item] = result.value;
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

      let vatnote = ' ';
      const getVatNoteUsecase = new GetVATNoteUsecase(
        payerRepo,
        addressRepo,
        vatService
      );
      const getVatNoteResult = await getVatNoteUsecase.execute(
        {
          invoiceId: parent.invoiceId,
          dateIssued: parent.dateIssued,
        },
        usecaseContext
      );

      if (getVatNoteResult.isRight()) {
        vatnote = getVatNoteResult.value;
      }

      return { ...rawItem, rate: Math.round(rate * 10000) / 10000, vatnote };
    },
    async payment(parent: Invoice, args, context) {
      const roles = getOptionalAuthRoles(context);

      const {
        repos: { payment: paymentRepo, invoice: invoiceRepo },
      } = context;

      const usecaseContext = {
        roles,
      };

      const usecase = new GetPaymentsByInvoiceIdUsecase(
        invoiceRepo,
        paymentRepo
      );

      const result = await usecase.execute(
        { invoiceId: parent.invoiceId },
        usecaseContext
      );

      if (result.isLeft()) {
        console.error(result.value);
        throw result.value.message;
      }

      const payment = result.value[0];

      if (!payment) {
        return null;
      }

      return PaymentMap.toPersistence(payment);
    },
    async payments(parent: Invoice, args, context) {
      const roles = getOptionalAuthRoles(context);

      const {
        repos: { invoice: invoiceRepo, payment: paymentRepo },
      } = context;

      const usecaseContext = {
        roles,
      };

      const usecase = new GetPaymentsByInvoiceIdUsecase(
        invoiceRepo,
        paymentRepo
      );

      const result = await usecase.execute(
        { invoiceId: parent.invoiceId },
        usecaseContext
      );

      if (result.isLeft()) {
        console.error(result.value);
        throw result.value.message;
      }

      const payments = result.value;

      if (!payments) {
        return null;
      }

      return payments.map((p) => PaymentMap.toPersistence(p));
    },
    async creditNote(parent: Invoice, args, context) {
      const roles = getAuthRoles(context);

      const {
        repos: { invoice: invoiceRepo, erpReference: erpReferenceRepo },
      } = context;
      const usecase = new GetCreditNoteByInvoiceIdUsecase(invoiceRepo);
      const getAssocInvoice = new GetInvoiceDetailsUsecase(invoiceRepo);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: parent.invoiceId,
      };

      const usecaseContext = {
        roles,
      };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const creditNoteDetails = result.value;

      let maybeErpRef = await erpReferenceRepo.getErpReferencesByInvoiceId(
        creditNoteDetails.invoiceId
      );

      if (maybeErpRef.isLeft()) {
        throw new Error(maybeErpRef.value.message);
      }

      const erpRef = maybeErpRef.value;

      const assocInvoiceResponse = await getAssocInvoice.execute(
        { invoiceId: creditNoteDetails.cancelledInvoiceReference },
        usecaseContext
      );
      if (assocInvoiceResponse.isLeft()) {
        return undefined;
      }

      const assocInvoice = assocInvoiceResponse.value;

      return {
        invoiceId: creditNoteDetails.id.toString(),
        cancelledInvoiceReference: creditNoteDetails.cancelledInvoiceReference,
        status: creditNoteDetails.status,
        dateCreated: creditNoteDetails?.dateCreated?.toISOString(),
        erpReferences: erpRef.getItems(),
        creationReason: creditNoteDetails.creationReason,
        dateIssued: creditNoteDetails?.dateIssued?.toISOString(),
        referenceNumber: assocInvoice.persistentReferenceNumber
          ? `CN-${assocInvoice.persistentReferenceNumber}`
          : '---',
      };
    },
    async transaction(parent: Invoice, args, context) {
      const roles = getOptionalAuthRoles(context);

      const {
        repos: { transaction: transactionRepo },
      } = context;

      const usecaseContext = {
        roles,
      };

      const usecase = new GetTransactionByInvoiceIdUsecase(transactionRepo);

      const result = await usecase.execute(
        { invoiceId: parent.invoiceId },
        usecaseContext
      );

      if (result.isLeft()) {
        console.error(result.value);
        throw result.value;
      }

      const transaction = result.value;

      if (!transaction) {
        return null;
      }

      return TransactionMap.toPersistence(transaction);
    },
  },
  InvoiceItem: {
    async article(parent, args, context) {
      if (!parent) return null;

      const roles = getOptionalAuthRoles(context);

      const getArticleUseCase = new GetArticleDetailsUsecase(
        context.repos.manuscript
      );

      const usecaseContext = {
        roles,
      };

      const article = await getArticleUseCase.execute(
        {
          articleId: parent.manuscriptId,
        },
        usecaseContext
      );

      if (article.isLeft()) {
        throw article.value;
      }

      return ArticleMap.toPersistence(article.value);
    },

    async coupons(parent, args, context) {
      const maybeCouponsAssociation = await context.repos.coupon.getCouponsByInvoiceItemId(
        InvoiceItemId.create(new UniqueEntityID(parent.id))
      );

      if (maybeCouponsAssociation.isLeft()) {
        throw new Error(maybeCouponsAssociation.value.message);
      }

      const couponsAssociation = maybeCouponsAssociation.value;

      return couponsAssociation
        .map((c) => c.coupon)
        .map(CouponMap.toPersistence);
    },

    async waivers(parent, args, context) {
      const maybeWaivers = (
        await context.repos.waiver.getWaiversByInvoiceItemId(
          InvoiceItemId.create(new UniqueEntityID(parent.id))
        )
      ).map((w) => w.waivers);

      if (maybeWaivers.isLeft()) {
        throw new Error(maybeWaivers.value.message);
      }

      return maybeWaivers.value.map(WaiverMap.toPersistence);
    },
  },
  Article: {
    async journalTitle(parent, args, context) {
      const catalogItem = await context.repos.catalog.getCatalogItemByJournalId(
        JournalId.create(new UniqueEntityID(parent.journalId))
      );

      if (catalogItem.isLeft()) {
        throw new Error(catalogItem.value.message);
      }

      return catalogItem.value?.journalTitle;
    },
  },
  Payment: {
    async paymentMethod(parent, args, context) {
      const roles = getOptionalAuthRoles(context);

      const getPaymentMethodUseCase = new GetPaymentMethodByIdUsecase(
        context.repos.paymentMethod
      );

      const usecaseContext = {
        roles,
      };

      const paymentMethod = await getPaymentMethodUseCase.execute(
        {
          paymentMethodId: parent.paymentMethodId,
        },
        usecaseContext
      );

      if (paymentMethod.isLeft()) {
        throw paymentMethod.value;
      }

      return PaymentMethodMap.toPersistence(paymentMethod.value);
    },
  },
  Mutation: {
    async applyCoupon(parent, args, context) {
      const roles = getOptionalAuthRoles(context);

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

      const usecaseContext = {
        roles,
      };

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

      const result = await applyCouponUsecase.execute(
        {
          couponCode: args.couponCode,
          invoiceId: args.invoiceId,
          sanctionedCountryNotificationReceiver,
          sanctionedCountryNotificationSender,
        },
        usecaseContext
      );

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return CouponMap.toPersistence(result.value);
    },
    async createCreditNote(parent, args, context): Promise<any> {
      const roles = getAuthRoles(context);

      const {
        repos: {
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          transaction: transactionRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
          pausedReminder: pausedReminderRepo,
        },
      } = context;

      const { invoiceId, createDraft, reason } = args;

      const createCreditNoteUsecase = new CreateCreditNoteUsecase(
        invoiceRepo,
        invoiceItemRepo,
        transactionRepo,
        couponRepo,
        waiverRepo,
        pausedReminderRepo
      );
      const usecaseContext = { roles };

      const result = await createCreditNoteUsecase.execute(
        {
          invoiceId,
          createDraft,
          reason,
        },
        usecaseContext
      );

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      const creditNote = result.value;

      const getInvoiceUsecase = new GetInvoiceDetailsUsecase(invoiceRepo);
      const retrieveInvoice = await getInvoiceUsecase.execute(
        { invoiceId },
        usecaseContext
      );

      if (retrieveInvoice.isLeft()) {
        console.log('Error getting associate invoice', invoiceId);
      }

      const invoice = result.value;

      return {
        id: creditNote.invoiceId.id.toString(),
        cancelledInvoiceReference: creditNote.cancelledInvoiceReference,
        status: creditNote.status,
        dateCreated: creditNote?.dateCreated?.toISOString(),
        creationReason: creditNote.creationReason,
        dateIssued: creditNote?.dateIssued?.toISOString(),
        referenceNumber: invoice
          ? `CN-${invoice.persistentReferenceNumber}`
          : '---',
      };
    },
  },
};
