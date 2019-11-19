// * Domain imports

import { Roles } from './../../../../../libs/shared/src/lib/modules/users/domain/enums/Roles';

import { SoftDeleteDraftTransactionUsecase } from './../../../../../libs/shared/src/lib/modules/transactions/usecases/softDeleteDraftTransaction/softDeleteDraftTransaction';
import { SoftDeleteDraftTransactionAuthorizationContext } from './../../../../../libs/shared/src/lib/modules/transactions/usecases/softDeleteDraftTransaction/softDeleteDraftTransactionAuthorizationContext';

const SUBMISSION_WITHDRAWN = 'SubmissionWithdrawn';
const defaultContext: SoftDeleteDraftTransactionAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN]
};

export const SubmissionWithdrawn = {
  event: SUBMISSION_WITHDRAWN,
  handler: async function submissionWithdrawnHandler(data: any) {
    console.log(`
[SubmissionWithdrawnHandler Incoming Event Data]:
${JSON.stringify(data)}
    `);

    const { submissionId } = data;

    const {
      repos: {
        transaction: transactionRepo,
        invoiceItem: invoiceItemRepo,
        invoice: invoiceRepo,
        manuscript: manuscriptRepo
      }
    } = this;

    const softDeleteDraftTransactionUsecase: SoftDeleteDraftTransactionUsecase = new SoftDeleteDraftTransactionUsecase(
      transactionRepo,
      invoiceItemRepo,
      invoiceRepo,
      manuscriptRepo
    );

    const result = await softDeleteDraftTransactionUsecase.execute(
      {
        manuscriptId: submissionId
      },
      defaultContext
    );

    if (result.isLeft()) {
      console.error(result.value.error);
    }
  }
};
