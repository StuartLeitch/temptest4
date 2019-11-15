// * Domain imports
// import {InvoiceStatus} from '@hindawi/shared';
// import {InvoiceId} from './../../../src/lib/modules/invoices/domain/InvoiceId';
// import {TransactionId} from './../../../src/lib/modules/transactions/domain/TransactionId';
// import {
//   // Transaction,
//   STATUS as TransactionStatus
// } from '../../../src/lib/modules/transactions/domain/Transaction';
// import {CatalogMap} from './../../../src/lib/modules/journals/mappers/CatalogMap';

import { Context } from '../../context';

// // * Usecases imports
import { Roles } from './../../../../../libs/shared/src/lib/modules/users/domain/enums/Roles';
import {
  CreateTransactionContext,
  CreateTransactionUsecase
} from '../../../../../libs/shared/src/lib/modules/transactions/usecases/createTransaction/createTransaction';
// import {CreateTransactionResponse} from './../../../src/lib/modules/transactions/usecases/createTransaction/createTransactionResponse';
const SUBMISSION_SUBMITTED = 'SubmissionSubmitted';
const defaultContext: CreateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

export const SubmissionSubmittedHandler = {
  event: SUBMISSION_SUBMITTED,
  handler: async function submissionSubmittedHandler(data: any) {
    const {
      submissionId,
      manuscripts: [
        {
          journalId,
          title,
          articleType: { name },
          created,
          authors: [{ email, country, surname }]
        }
      ]
    } = data;

    console.log(`
      [SubmissionSubmittedHandler Incoming Event Data]:
      ${JSON.stringify(data)}
  `);

    const {
      repos: {
        transaction: transactionRepo,
        invoice: invoiceRepo,
        invoiceItem: invoiceItemRepo,
        catalog: catalogRepo
      }
    } = this;

    const createTransactionUsecase: CreateTransactionUsecase = new CreateTransactionUsecase(
      transactionRepo,
      invoiceRepo,
      invoiceItemRepo,
      catalogRepo
    );

    const result = await createTransactionUsecase.execute(
      {
        manuscriptId: submissionId,
        journalId
      },
      defaultContext
    );

    if (result.isLeft()) {
      throw result.value.error;
    } else {
      const newTransaction = result.value.getValue();

      console.log(`
        [SubmissionSubmittedHandler]:
        ${JSON.stringify(newTransaction)}
      `);
    }
  }
};
