import { Resolvers } from '../schema';

import { Context } from '../../builders';

import {
  GetCreditNoteByReferenceNumberUsecase,
  GetCreditNoteByReferenceNumberDTO,
  GetCreditNoteByInvoiceIdUsecase,
  GetCreditNoteByInvoiceIdDTO,
  GetRecentCreditNotesUsecase,
  CreateCreditNoteRequestDTO,
  GetCreditNoteByIdUsecase,
  GetInvoiceDetailsUsecase,
  CreateCreditNoteUsecase,
  GetRecentCreditNotesDTO,
  GetCreditNoteByIdDTO,
  GetInvoiceDetailsDTO,
  CreditNoteMap,
  InvoiceMap,
  Roles,
} from '@hindawi/shared';

import { handleForbiddenUsecase, getAuthRoles } from './utils';

export const creditNote: Resolvers<Context> = {
  Query: {
    async getCreditNoteById(parent, args, context) {
      const contextRoles = getAuthRoles(context);

      const { repos } = context;
      const usecase = new GetCreditNoteByIdUsecase(repos.creditNote);
      const associatedInvoice = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetCreditNoteByIdDTO = { creditNoteId: args.creditNoteId };

      const usecaseContext = { roles: contextRoles };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      const invoiceRequest: GetInvoiceDetailsDTO = {
        invoiceId: result.value.invoiceId.toString(),
      };

      const invoiceResult = await associatedInvoice.execute(
        invoiceRequest,
        usecaseContext
      );

      if (invoiceResult.isLeft()) {
        throw new Error(invoiceResult.value.message);
      }
      return {
        ...CreditNoteMap.toPersistence(result.value),
        invoice: {
          ...InvoiceMap.toPersistence(invoiceResult.value),
          invoiceId: invoiceResult.value.id.toString(),
          referenceNumber: invoiceResult.value.persistentReferenceNumber,
        },
      };
    },
    async getCreditNoteByInvoiceId(parent, args, context) {
      const contextRoles = getAuthRoles(context);

      const { repos } = context;
      const usecase = new GetCreditNoteByInvoiceIdUsecase(repos.creditNote);

      const request: GetCreditNoteByInvoiceIdDTO = {
        invoiceId: args.invoiceId,
      };

      const usecaseContext = { roles: contextRoles };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return CreditNoteMap.toPersistence(result.value);
    },
    async getRecentCreditNotes(parent, args: GetRecentCreditNotesDTO, context) {
      const contextRoles = getAuthRoles(context);

      const { repos } = context;
      const usecase = new GetRecentCreditNotesUsecase(repos.creditNote);

      const usecaseContext = {
        roles: contextRoles,
      };

      const result = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      const creditNotesList = result.value;

      return {
        totalCount: +creditNotesList.totalCount,
        creditNotes: creditNotesList.creditNotes.map(
          CreditNoteMap.toPersistence
        ),
      };
    },

    async getCreditNoteByReferenceNumber(parents, args, context) {
      const contextRoles = getAuthRoles(context);

      const { repos } = context;
      const usecase = new GetCreditNoteByReferenceNumberUsecase(
        repos.creditNote
      );

      const usecaseContext = { roles: contextRoles };
      const request: GetCreditNoteByReferenceNumberDTO = {
        referenceNumber: args.referenceNumber,
      };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return CreditNoteMap.toPersistence(result.value);
    },
  },
  CreditNote: {
    async invoice(parent: any, args, context) {
      const contextRoles = getAuthRoles(context);

      const {
        repos: { invoice: invoiceRepo },
      } = context;

      const usecaseContext = {
        roles: contextRoles,
      };
      const associatedInvoiceUsecase = new GetInvoiceDetailsUsecase(
        invoiceRepo
      );

      const request: any = { invoiceId: parent.invoiceId };

      const result = await associatedInvoiceUsecase.execute(
        request,
        usecaseContext
      );

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      const invoiceDetails = result.value;

      return {
        invoiceId: invoiceDetails.id.toString(),
        status: invoiceDetails.status,
        dateCreated: invoiceDetails?.dateCreated?.toISOString(),
        dateAccepted: invoiceDetails?.dateAccepted?.toISOString(),
        dateMovedToFinal: invoiceDetails?.dateMovedToFinal?.toISOString(),
        dateIssued: invoiceDetails?.dateIssued?.toISOString(),
        referenceNumber: invoiceDetails.persistentReferenceNumber,
      };
    },
  },
  Mutation: {
    async createCreditNote(parent, args, context) {
      const contextRoles = getAuthRoles(context);

      const {
        repos: {
          pausedReminder: pausedReminderRepo,
          invoiceItem: invoiceItemRepo,
          creditNote: creditNoteRepo,
          invoice: invoiceRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
        },
      } = context;

      const request: CreateCreditNoteRequestDTO = {
        invoiceId: args.invoiceId,
        createDraft: args.createDraft,
        reason: args.reason,
      };

      const usecase = new CreateCreditNoteUsecase(
        creditNoteRepo,
        invoiceRepo,
        invoiceItemRepo,
        couponRepo,
        waiverRepo,
        pausedReminderRepo
      );
      const usecaseContext = { roles: contextRoles };

      const result = await usecase.execute(request, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      const creditNote = result.value;
      const getInvoiceUsecase = new GetInvoiceDetailsUsecase(invoiceRepo);
      const retrieveInvoice = await getInvoiceUsecase.execute(
        {
          invoiceId: args.invoiceId,
        },
        usecaseContext
      );

      if (retrieveInvoice.isLeft()) {
        throw Error(retrieveInvoice.value.message);
      }

      const invoice = retrieveInvoice.value;

      return {
        ...CreditNoteMap.toPersistence(creditNote),
        referenceNumber: `CN-${invoice.persistentReferenceNumber}`,
      };
    },
  },
};
