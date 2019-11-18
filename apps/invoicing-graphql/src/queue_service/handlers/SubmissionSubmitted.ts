// * Domain imports
// import {InvoiceStatus} from '@hindawi/shared';

import { Roles } from './../../../../../libs/shared/src/lib/modules/users/domain/enums/Roles';

import { ManuscriptTypeNotInvoiceable } from './../../../../../libs/shared/src/lib/modules/manuscripts/domain/ManuscriptTypes';
import {
  CreateTransactionContext,
  CreateTransactionUsecase
} from '../../../../../libs/shared/src/lib/modules/transactions/usecases/createTransaction/createTransaction';
import { CreateManuscriptUsecase } from '../../../../../libs/shared/src/lib/modules/manuscripts/usecases/createManuscript/createManuscript';
import { CreateManuscriptDTO } from './../../../../../libs/shared/src/lib/modules/manuscripts/usecases/createManuscript/createManuscriptDTO';

const SUBMISSION_SUBMITTED = 'SubmissionSubmitted';
const defaultContext: CreateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

export const SubmissionSubmittedHandler = {
  event: SUBMISSION_SUBMITTED,
  handler: async function submissionSubmittedHandler(data: any) {
    console.log(`
[SubmissionSubmittedHandler Incoming Event Data]:
${JSON.stringify(data)}
    `);

    const {
      submissionId,
      manuscripts: [
        {
          customId,
          journalId,
          title,
          articleType: { name },
          created,
          authors
        }
      ]
    } = data;

    const { email, country, surname, givenNames } = authors.find(
      (a: any) => a.isCorresponding
    );

    if (name in ManuscriptTypeNotInvoiceable) {
      return;
    }

    const {
      repos: {
        transaction: transactionRepo,
        invoice: invoiceRepo,
        invoiceItem: invoiceItemRepo,
        catalog: catalogRepo,
        manuscript: manuscriptRepo
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
      console.error(result.value.error);
    } else {
      const newTransaction = result.value.getValue();

      console.log(`
[SubmissionSubmittedHandler Transaction Data]:
${JSON.stringify(newTransaction)}
        `);

      const manuscriptProps: CreateManuscriptDTO = {
        id: submissionId,
        customId,
        journalId,
        title,
        articleType: name,
        authorEmail: email,
        authorCountry: country,
        authorSurname: surname,
        authorFirstName: givenNames,
        created
      };

      const createManuscript: CreateManuscriptUsecase = new CreateManuscriptUsecase(
        manuscriptRepo
      );

      const createManuscriptResult = await createManuscript.execute(
        manuscriptProps,
        defaultContext
      );

      if (createManuscriptResult.isLeft()) {
        throw createManuscriptResult.value.error;
      } else {
        const newManuscript = createManuscriptResult.value.getValue();

        console.log(`
[SubmissionSubmittedHandler Manuscript Data]:
${JSON.stringify(newManuscript)}
          `);
      }
    }
  }
};
