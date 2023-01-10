import {
  GetInvoiceIdByManuscriptCustomIdUsecase,
  GetInvoiceIdByManuscriptCustomIdDTO,
  GetTransactionByInvoiceIdUsecase,
  GetCreditNoteByInvoiceIdUsecase,
  GetPaymentsByInvoiceIdUsecase,
  ApplyCouponToInvoiceUsecase,
  GetCreditNoteByInvoiceIdDTO,
  GetPaymentMethodByIdUsecase,
  GetItemsForInvoiceUsecase,
  GetArticleDetailsUsecase,
  GetInvoiceDetailsUsecase,
  GetRecentInvoicesUsecase,
  GetInvoiceDetailsDTO,
  GetVATNoteUsecase,
  PaymentMethodMap,
  InvoiceItemMap,
  TransactionMap,
  UniqueEntityID,
  CreditNoteMap,
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
  getAuthRoles, invoiceChargingDetails, getCouponsAndWaivers,
} from './utils';


export const invoice: Resolvers<Context> = {
  Query: {
    async invoice(parent, args, context): Promise<any> {
      const { repos } = context;

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
        context.loggerBuilder.getLogger('getInvoice').error(err.message, err);
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const invoiceDetails = result.value;

      const assocInvoice = null;
      // * this is a credit note, let's ask for the reference number of the associated invoice
      const maybePayments = await repos.payment.getPaymentsByInvoiceId(
        invoiceDetails.invoiceId
      );

      if (maybePayments.isLeft()) {
        throw maybePayments.value;
      }

      const payments = maybePayments.value;

      const paymentsIds = payments.map((p) => p.id);

      const maybeErpPaymentReferences =
        await repos.erpReference.getErpReferencesById(paymentsIds);

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
        dateIssued: invoiceDetails?.dateIssued?.toISOString(),
        referenceNumber: assocInvoice
          ? assocInvoice.persistentReferenceNumber
          : invoiceDetails.persistentReferenceNumber,
      };
    },

    async invoiceWithAuthorization(parent, args, context): Promise<any> {
      const { repos } = context;
      const contextRoles = getAuthRoles(context);

      const usecase = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetInvoiceDetailsDTO = {
        invoiceId: args.invoiceId,
      };

      const usecaseContext = {
        roles: contextRoles,
      };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        const err = result.value;
        context.loggerBuilder
          .getLogger('getInvoiceWithAuthorization')
          .error(err.message, err);
        return undefined;
      }

      // There is a TSLint error for when try to use a shadowed variable!
      const invoiceDetails = result.value;

      const assocInvoice = null;

      const maybePayments = await repos.payment.getPaymentsByInvoiceId(
        invoiceDetails.invoiceId
      );

      if (maybePayments.isLeft()) {
        throw maybePayments.value;
      }

      const payments = maybePayments.value;

      const paymentsIds = payments.map((p) => p.id);

      const maybeErpPaymentReferences =
        await repos.erpReference.getErpReferencesById(paymentsIds);

      if (maybeErpPaymentReferences.isLeft()) {
        throw maybeErpPaymentReferences.value;
      }

      const erpPaymentReferences = maybeErpPaymentReferences.value;

      const getItemsUseCase = new GetItemsForInvoiceUsecase(
        repos.invoiceItem,
        repos.coupon,
        repos.waiver,
      );

      const maybeInvoiceItems = await getItemsUseCase.execute(
        {
          invoiceId: invoiceDetails.id.toString(),
        },
        usecaseContext
      );

      let invoiceItem;
      if (maybeInvoiceItems.isLeft()) {
        invoiceItem = null;
      } else {
        const [item] = maybeInvoiceItems.value;
        invoiceItem = item
      }

      const {coupons, waivers} = await getCouponsAndWaivers(context, invoiceItem);
      const { vat, price, taDiscount } = invoiceItem;

      const invoiceCharges = invoiceChargingDetails(coupons, waivers, price, taDiscount, vat);

      return {
        invoiceId: invoiceDetails.id.toString(),
        status: invoiceDetails.status,
        dateCreated: invoiceDetails?.dateCreated?.toISOString(),
        dateAccepted: invoiceDetails?.dateAccepted?.toISOString(),
        dateMovedToFinal: invoiceDetails?.dateMovedToFinal?.toISOString(),
        totalPrice: invoiceCharges.totalCharges,
        vatAmount: invoiceCharges.vatAmount,
        netCharges: invoiceCharges.netCharges,
        erpReferences: invoiceDetails
          .getErpReferences()
          .getItems()
          .concat(erpPaymentReferences),
        dateIssued: invoiceDetails?.dateIssued?.toISOString(),
        referenceNumber: assocInvoice
          ? assocInvoice.persistentReferenceNumber
          : invoiceDetails.persistentReferenceNumber,
      };
    },
    async invoices(parent, args, context) {
      const contextRoles = getAuthRoles(context);

      const { repos } = context;

      const usecase = new GetRecentInvoicesUsecase(repos.invoice);
      const getItemsUseCase = new GetItemsForInvoiceUsecase(
        repos.invoiceItem,
        repos.coupon,
        repos.waiver,
      );

      const usecaseContext = {
        roles: contextRoles,
      };
      const result = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        return undefined;
      }

      const invoicesList = result.value;

      const getInvoices = async () =>
        Promise.all(
          invoicesList.invoices.map(async (invoiceDetails: any) => {
            const assocInvoice = null;

            const maybeInvoiceItems = await getItemsUseCase.execute(
              {
                invoiceId: invoiceDetails.invoiceId,
              },
              usecaseContext
            );

            let invoiceItem;
            if (maybeInvoiceItems.isLeft()) {
              invoiceItem = null;
            } else {
              const [item] = maybeInvoiceItems.value;
              invoiceItem = item
            }

            const {coupons, waivers} = await getCouponsAndWaivers(context, invoiceItem);
            const { vat, price, taDiscount } = invoiceItem;

            const invoiceCharges = invoiceChargingDetails(coupons, waivers, price, taDiscount, vat);

            return {
              ...InvoiceMap.toPersistence(invoiceDetails),
              invoiceId: invoiceDetails.id.toString(),
              dateCreated: invoiceDetails?.dateCreated?.toISOString(),
              dateAccepted: invoiceDetails?.dateAccepted?.toISOString(),
              dateIssued: invoiceDetails?.dateIssued?.toISOString(),
              totalPrice: invoiceCharges.totalCharges,
              vatAmount: invoiceCharges.vatAmount,
              netCharges: invoiceCharges.netCharges,
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

      const invoiceDetails = result.value;

      const exchangeDate =
        invoiceDetails.dateIssued || invoiceDetails.dateCreated
          ? new Date(invoiceDetails.dateIssued || invoiceDetails.dateCreated)
          : null;

      const exchangeRate = await exchangeRateService.getExchangeRate(
        exchangeDate
      );

      const rate = exchangeRate.exchangeRate;

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
      const invoiceId = InvoiceId.create(new UniqueEntityID(parent.invoiceId));

      const maybePayer = await payerRepo.getPayerByInvoiceId(invoiceId);

      if (maybePayer.isLeft()) {
        return null;
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

      const exchangeDate = parent?.dateIssued
        ? new Date(parent?.dateIssued)
        : null;

      const exchangeRate = await exchangeRateService.getExchangeRate(
        exchangeDate
      );

      const rate = exchangeRate.exchangeRate;

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

      return { ...rawItem, rate, vatnote };
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

    // * to look forward
    async creditNote(parent: Invoice, args, context) {
      const { repos } = context;

      const usecase = new GetCreditNoteByInvoiceIdUsecase(repos.creditNote);

      const usecaseContext = { roles: [Roles.ADMIN] };

      const creditNoteRequest: GetCreditNoteByInvoiceIdDTO = {
        invoiceId: parent.invoiceId,
      };

      const creditNote = await usecase.execute(
        creditNoteRequest,
        usecaseContext
      );
      if (creditNote.isLeft()) {
        return null;
      }
      const maybeErpCreditNoteReferences =
        await repos.erpReference.getErpReferenceById(creditNote.value.id);

      const creditNoteErpReference = maybeErpCreditNoteReferences.isRight()
        ? maybeErpCreditNoteReferences.value
        : null;

      return {
        ...CreditNoteMap.toPersistence(creditNote.value),
        erpReference: creditNoteErpReference,
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
      // console.info('In Invoice Item/article...')
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
      const maybeCouponsAssociation =
        await context.repos.coupon.getCouponsByInvoiceItemId(
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
  InvoicingArticle: {
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
      const userData = (context.keycloakAuth.accessToken as any)?.content;

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
        services: { emailService, vatService },
        loggerBuilder,
        auditLoggerServiceProvider,
      } = context;

      const loggerService = loggerBuilder.getLogger(
        ApplyCouponToInvoiceUsecase.name
      );

      const {
        sanctionedCountryNotificationReceiver,
        sanctionedCountryNotificationSender,
      } = env.app;

      const usecaseContext = {
        roles,
      };

      const auditLoggerService = auditLoggerServiceProvider(userData);
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
        loggerService,
        auditLoggerService
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
  },
};
