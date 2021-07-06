import { Resolvers, CreditNote } from '../schema';

import { Context } from '../../builders';
import {
  GetCreditNoteByIdUsecase,
  GetCreditNoteByIdDTO,
  CreditNoteMap,
  InvoiceMap,
  Roles,
  GetRecentCreditNotesUesecase,
  GetRecentCreditNotesDTO,
  GetCreditNoteByReferenceNumberUsecase,
  GetCreditNoteByReferenceNumberDTO,
  GetInvoiceDetailsUsecase,
  GetInvoiceDetailsDTO,
  GetCreditNoteByInvoiceIdUsecase,
  GetCreditNoteByInvoiceIdDTO,
} from '@hindawi/shared';

import { CreateCreditNoteUsecase } from '../../../../../libs/shared/src/lib/modules/creditNotes/usecases/createCreditNote/createCreditNote';
import { CreateCreditNoteRequestDTO } from '../../../../../libs/shared/src/lib/modules/creditNotes/usecases/createCreditNote/createCreditNoteDTO';

export const creditNote: Resolvers<Context> = {
  Query: {
    async getCreditNoteById(parent, args, context) {
      const { repos } = context;
      const usecase = new GetCreditNoteByIdUsecase(repos.creditNote);
      const associatedInvoice = new GetInvoiceDetailsUsecase(repos.invoice);

      const request: GetCreditNoteByIdDTO = { creditNoteId: args.creditNoteId };

      const usecaseContext = { roles: [Roles.ADMIN] };

      const result = await usecase.execute(request, usecaseContext);

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
        },
      };
    },
    async getCreditNoteByInvoiceId(parent, args, context) {
      const { repos } = context;
      const usecase = new GetCreditNoteByInvoiceIdUsecase(repos.creditNote);

      const request: GetCreditNoteByInvoiceIdDTO = {
        invoiceId: args.invoiceId,
      };

      const usecaseContext = { roles: [Roles.ADMIN] };

      const result = await usecase.execute(request, usecaseContext);

      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return CreditNoteMap.toPersistence(result.value);
    },
    async getRecentCreditNotes(parent, args: GetRecentCreditNotesDTO, context) {
      const { repos } = context;
      const usecase = new GetRecentCreditNotesUesecase(repos.creditNote);

      const usecaseContext = {
        roles: [Roles.ADMIN],
      };

      const result = await usecase.execute(args, usecaseContext);
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
      const { repos } = context;
      const usecase = new GetCreditNoteByReferenceNumberUsecase(
        repos.creditNote
      );

      const usecaseContext = { roles: [Roles.ADMIN] };
      const request: GetCreditNoteByReferenceNumberDTO = {
        referenceNumber: args.referenceNumber,
      };

      const result = await usecase.execute(request, usecaseContext);
      if (result.isLeft()) {
        throw new Error(result.value.message);
      }

      return CreditNoteMap.toPersistence(result.value);
    },
  },
  Mutation: {
    async createCreditNote(parent, args, context) {
      const {
        repos: {
          creditNote: creditNoteRepo,
          invoice: invoiceRepo,
          invoiceItem: invoiceItemRepo,
          transaction: transactionRepo,
          coupon: couponRepo,
          waiver: waiverRepo,
          pausedReminder: pausedReminderRepo,
        },
        services: { waiverService },
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
        transactionRepo,
        couponRepo,
        waiverRepo,
        pausedReminderRepo
      );
      const usecaseContext = { roles: [Roles.ADMIN] };

      const result = await usecase.execute(request, usecaseContext);
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
