/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable max-len */

import { SubmissionWithdrawn as SubmissionWithdrawnPayload } from '@hindawi/phenom-events';
// * Domain imports
import {
  UsecaseAuthorizationContext,
  Roles,
  ManuscriptTypeNotInvoiceable,
  SoftDeleteDraftTransactionUsecase,
} from '@hindawi/shared';

const SUBMISSION_WITHDRAWN = 'SubmissionWithdrawn';
const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.SUPER_ADMIN],
};

export const SubmissionWithdrawn = {
  event: SUBMISSION_WITHDRAWN,
  handler: async function submissionWithdrawnHandler(
    data: SubmissionWithdrawnPayload
  ) {
    const {
      repos: {
        transaction: transactionRepo,
        invoiceItem: invoiceItemRepo,
        invoice: invoiceRepo,
        manuscript: manuscriptRepo,
      },
      services: { logger },
    } = this;

    logger.setScope(`PhenomEvent:${SUBMISSION_WITHDRAWN}`);
    logger.info('Incoming Event Data', data);

    const {
      submissionId,
      manuscripts: [
        {
          articleType: { name },
        },
      ],
    } = data;

    if (name in ManuscriptTypeNotInvoiceable) {
      return;
    }

    const softDeleteDraftTransactionUsecase: SoftDeleteDraftTransactionUsecase = new SoftDeleteDraftTransactionUsecase(
      transactionRepo,
      invoiceItemRepo,
      invoiceRepo,
      manuscriptRepo
    );

    const result = await softDeleteDraftTransactionUsecase.execute(
      {
        manuscriptId: submissionId,
      },
      defaultContext
    );

    if (result.isLeft()) {
      logger.error(result.value.errorValue().message);
      throw result.value.error;
    }
  },
};
