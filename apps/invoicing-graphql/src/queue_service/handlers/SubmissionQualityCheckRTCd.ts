import { SubmissionQualityCheckRTCd as SubmissionQualityCheckRTCdEvent } from '@hindawi/phenom-events';

import {
  SoftDeleteDraftTransactionUsecase,
  ManuscriptTypeNotInvoiceable,
  UsecaseAuthorizationContext,
  Roles,
} from '@hindawi/shared';

import { Context } from '../../builders';

import { EventHandler } from '../event-handler';

const SUBMISSION_QUALITY_CHECK_RTCD = 'SubmissionQualityCheckRTCd';

const defaultContext: UsecaseAuthorizationContext = {
  roles: [Roles.QUEUE_EVENT_HANDLER],
};

export const SubmissionQualityCheckRTCd: EventHandler<SubmissionQualityCheckRTCdEvent> =
  {
    event: SUBMISSION_QUALITY_CHECK_RTCD,
    handler(context: Context) {
      return async (data: SubmissionQualityCheckRTCdEvent): Promise<void> => {
        const {
          repos: {
            transaction: transactionRepo,
            invoiceItem: invoiceItemRepo,
            invoice: invoiceRepo,
            manuscript: manuscriptRepo,
          },
          loggerBuilder,
        } = context;

        const logger = loggerBuilder.getLogger(
          `PhenomEvent:${SUBMISSION_QUALITY_CHECK_RTCD}`
        );

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

        const softDeleteDraftTransactionUsecase: SoftDeleteDraftTransactionUsecase =
          new SoftDeleteDraftTransactionUsecase(
            transactionRepo,
            invoiceItemRepo,
            invoiceRepo,
            manuscriptRepo,
            logger
          );

        const result = await softDeleteDraftTransactionUsecase.execute(
          {
            manuscriptId: submissionId,
          },
          defaultContext
        );

        if (result.isLeft()) {
          logger.error(result.value.message);
          throw result.value;
        }
      };
    },
  };
