// * Domain imports
// import {InvoiceStatus} from '@hindawi/shared';

import { Roles } from './../../../../../libs/shared/src/lib/modules/users/domain/enums/Roles';

import {
  UpdateTransactionContext,
  UpdateTransactionOnAcceptManuscriptUsecase
} from '../../../../../libs/shared/src/lib/modules/transactions/usecases/updateTransactionOnAcceptManuscript/updateTransactionOnAcceptManuscript';
const SUBMISSION_ACCEPTED = 'SubmissionAccepted';
const defaultContext: UpdateTransactionContext = { roles: [Roles.SUPER_ADMIN] };

export const SubmissionAcceptedHandler = {
  event: SUBMISSION_ACCEPTED,
  handler: async function submissionSubmittedHandler(data: any) {
    const {
      submissionId,
      manuscripts: [{ journalId }]
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
        manuscript: manuscriptRepo,
        waiver: waiverRepo
      },
      waiverService
    } = this;

    const updateTransactionOnAcceptManuscript: UpdateTransactionOnAcceptManuscriptUsecase = new UpdateTransactionOnAcceptManuscriptUsecase(
      transactionRepo,
      invoiceItemRepo,
      invoiceRepo,
      catalogRepo,
      manuscriptRepo,
      waiverRepo,
      waiverService
    );

    const result = await updateTransactionOnAcceptManuscript.execute(
      {
        manuscriptId: submissionId,
        journalId
      },
      defaultContext
    );

    if (result.isLeft()) {
      console.error(result.value.error);
    } else {
      const changedTransaction = result.value.getValue();

      console.log(`
[SubmissionAcceptedHandler Transaction Data]:
${JSON.stringify(changedTransaction)}
        `);

      //       const manuscriptProps: CreateManuscriptDTO = {
      //         manuscriptId: submissionId,
      //         customId,
      //         journalId,
      //         title,
      //         articleTypeId: name,
      //         authorEmail: email,
      //         authorCountry: country,
      //         authorSurname: surname,
      //         created
      //       };

      //       const createManuscript: CreateManuscriptUsecase = new CreateManuscriptUsecase(
      //         manuscriptRepo
      //       );

      //       const createManuscriptResult = await createManuscript.execute(
      //         manuscriptProps,
      //         defaultContext
      //       );

      //       if (createManuscriptResult.isLeft()) {
      //         throw result.value.error;
      //       } else {
      //         const newManuscript = result.value.getValue();

      //         console.log(`
      // [SubmissionSubmittedHandler Manuscript Data]:
      // ${JSON.stringify(newManuscript)}
      //           `);
      //       }
    }
  }
};
