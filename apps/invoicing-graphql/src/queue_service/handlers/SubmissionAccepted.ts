// * Domain imports
// import {InvoiceStatus} from '@hindawi/shared';

import { Roles } from './../../../../../libs/shared/src/lib/modules/users/domain/enums/Roles';

import {
  CreateTransactionContext,
  CreateTransactionUsecase
} from '../../../../../libs/shared/src/lib/modules/transactions/usecases/createTransaction/createTransaction';
import { CreateManuscriptUsecase } from '../../../../../libs/shared/src/lib/modules/manuscripts/usecases/createManuscript/createManuscript';
import { CreateManuscriptDTO } from './../../../../../libs/shared/src/lib/modules/manuscripts/usecases/createManuscript/createManuscriptDTO';

const SUBMISSION_ACCEPTED = 'SubmissionAccepted';
const defaultContext: CreateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

export const SubmissionAcceptedHandler = {
  event: SUBMISSION_ACCEPTED,
  handler: async function submissionSubmittedHandler(data: any) {
    const {
      submissionId,
      manuscripts: [
        {
          customId,
          journalId,
          title,
          articleType: { name },
          created,
          authors: [{ email, country, surname }]
        }
      ]
    } = data;

    console.log(`
[SubmissionAcceptedHandler Incoming Event Data]:
${JSON.stringify(data)}
    `);

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
        manuscriptId: submissionId,
        customId,
        journalId,
        title,
        articleTypeId: name,
        authorEmail: email,
        authorCountry: country,
        authorSurname: surname,
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
        throw result.value.error;
      } else {
        const newManuscript = result.value.getValue();

        console.log(`
[SubmissionSubmittedHandler Manuscript Data]:
${JSON.stringify(newManuscript)}
          `);
      }
    }
  }
};
