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
  GetRecentLogsUsecase,
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

export const audit: Resolvers<Context> = {
  Query: {
    async auditlogs(parent, args, context) {
      const contextRoles = getAuthRoles(context);

      const { repos } = context;

      const usecase = new GetRecentLogsUsecase(repos.audit);
      const usecaseContext = {
         roles: contextRoles,
      };
      const result = await usecase.execute(args, usecaseContext);

      handleForbiddenUsecase(result);

      if (result.isLeft()) {
        return undefined;
      }

      const logsList = result.value;

      return {
        totalCount: logsList.totalCount,
        logs: logsList.auditLogs
      };
    }
  }
};
